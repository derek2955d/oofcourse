import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { publicDB, configured } from "@/lib/supabase/server";
import { Store, MapPin, ArrowUpRight } from "lucide-react";
import { enabledAreas, selectedState } from "@/lib/geography-server";
import { loadTaxonomy } from "@/lib/taxonomy-server";
export async function BusinessDirectory({
  state,
  location = "",
  keyword = "",
  subtype = "",
  limit = 6,
}: {
  state?: string;
  location?: string;
  keyword?: string;
  subtype?: string;
  limit?: number;
}) {
  if (!configured()) return null;
  const db = publicDB();
  const targetState = await selectedState(state);
  let scope: Awaited<ReturnType<typeof enabledAreas>>;
  try {
    scope = (await enabledAreas(targetState)).filter(
      (a) =>
        a.state === targetState &&
        (!location ||
          (location === "nyc"
            ? targetState === "NY" && a.city === "New York"
            : a.id === location)),
    );
  } catch {
    const t = await getTranslations();
    return (
      <p className="notice error-notice" role="alert">
        {t("dataError")}
      </p>
    );
  }
  if (!scope.length) return null;
  let query = db
    .from("business_profiles")
    .select("id,name,category,location,description,logo_path")
    .eq("status", "approved")
    .in(
      "location",
      scope.map((a) => a.id),
    )
    .order("created_at", { ascending: false })
    .limit(limit);
  if (location && location !== "nyc") query = query.eq("location", location);
  if (subtype) query = query.eq("category", subtype);
  if (keyword) query = query.ilike("name", `%${keyword.slice(0, 150)}%`);
  const { data, error } = await query;
  const t = await getTranslations(),
    l = await getLocale(),
    taxonomy = await loadTaxonomy();
  if (error)
    return (
      <p className="notice error-notice" role="alert">
        {t("dataError")}
      </p>
    );
  if (!data?.length) return null;
  const logos = await Promise.all(
    data.map(async (b) => {
      if (!b.logo_path) return "";
      const { data } = await db.storage
        .from("business-logos")
        .createSignedUrl(b.logo_path, 300);
      return data?.signedUrl || "";
    }),
  );
  return (
    <section className="business-directory">
      <h2>{t("business")}</h2>
      <div className="business-grid">
        {data.map((b, i) => (
          <article className="business-card" key={b.id}>
            {logos[i] ? (
              <Image src={logos[i]} alt="" width={56} height={56} unoptimized />
            ) : (
              <span
                className="category-icon"
                style={{ background: "#FFE9E5", color: "#B85C4A" }}
              >
                <Store size={25} />
              </span>
            )}
            <h3>
              <Link href={`/businesses/profiles/${b.id}`}>{b.name}</Link>
            </h3>
            <p>{b.description.slice(0, 140)}</p>
            <small>
              <MapPin size={13} />
              {taxonomy.locations.find((a) => a[0] === b.location)?.[
                l === "zh" ? 2 : 1
              ] || b.location}
            </small>
            <Link className="text-link" href={`/businesses/profiles/${b.id}`}>
              {t("viewBusiness")}
              <ArrowUpRight size={14} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
