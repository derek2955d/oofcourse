import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { configured, publicDB } from "@/lib/supabase/server";
import { pageMetadata } from "@/lib/seo";
import { locationLabel, type Locale } from "@/lib/catalog";
import { Link } from "@/i18n/navigation";
import { MapPin, ArrowUpRight, Store } from "lucide-react";
async function getBusiness(id: string) {
  if (!configured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = publicDB();
  const { data, error } = await db
    .from("business_profiles")
    .select("id,name,category,location,description,website,logo_path")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();
  if (error) throw new Error("dataError");
  return data;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const data = await getBusiness(id);
  return pageMetadata(
    locale,
    data?.name || "Business unavailable",
    data?.description.slice(0, 155) || "Business profile unavailable.",
    `/businesses/profiles/${id}`,
    !data,
  );
}
export default async function BusinessProfile({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const data = await getBusiness(id);
  if (!data) notFound();
  const t = await getTranslations();
  let logo = "";
  if (data.logo_path) {
    const { data: signed } = await publicDB()
      .storage.from("business-logos")
      .createSignedUrl(data.logo_path, 300);
    logo = signed?.signedUrl || "";
  }
  let website = "";
  try {
    const u = new URL(data.website || "");
    if (u.protocol === "https:" && !u.username && !u.password) website = u.href;
  } catch {}
  return (
    <article className="container page legal">
      <nav className="breadcrumbs">
        <Link href="/businesses">{t("businesses")}</Link>
      </nav>
      <div className="surface">
        {logo ? (
          <Image
            src={logo}
            alt={data.name}
            width={100}
            height={100}
            unoptimized
          />
        ) : (
          <Store size={42} color="#D16B59" />
        )}
        <h1 className="page-title">{data.name}</h1>
        <p className="card-location">
          <MapPin size={15} />
          {locationLabel(data.location, locale)}
        </p>
        <p className="notice">{data.category}</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{data.description}</p>
        {website && (
          <a
            href={website}
            target="_blank"
            rel="ugc nofollow noopener noreferrer"
            className="button button-outline"
            style={{ marginTop: 24 }}
          >
            {t("website")}
            <ArrowUpRight size={16} />
          </a>
        )}
      </div>
    </article>
  );
}
