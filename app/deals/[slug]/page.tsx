import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, ArrowUpRight, Info, ShieldCheck } from "lucide-react";
import { products, categories, displayPrice } from "@/lib/data";
import { metadata } from "@/lib/seo";
import {
  MerchantLink,
  ProductCard,
  RetailerBadge,
  SectionHeading,
} from "@/components/site";
import { SaveButton } from "@/components/saved";
export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  return metadata(
    p ? `${p.name} — Demo Concept` : "Find not found",
    p
      ? `${p.name}: an original OofCourse demonstration concept. No verified pricing or purchasing links.`
      : "This listing could not be found.",
    `/deals/${slug}`,
    true,
  );
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const c = categories.find((c) => c.slug === p.category)!;
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/category/${c.slug}`}>{c.name}</Link>
        <span>/</span>
        <span>Demo concept</span>
      </nav>
      <div className="detail-grid">
        <div>
          <div className="detail-image" style={{ background: p.color }}>
            <span className="demo-pill">ORIGINAL DEMO CONCEPT</span>
            <Image
              src={p.imageUrl}
              alt={`Original illustration of ${p.name}`}
              width={600}
              height={484}
              priority
            />
          </div>
          <p className="image-credit">
            Original OofCourse concept illustration. Not a merchant product
            photograph.
          </p>
        </div>
        <div className="detail-copy">
          <div className="detail-kicker">
            <RetailerBadge retailer={p.retailer} />
            <span className="status-label">
              {p.status === "expired" ? "Expired demo" : "Unverified demo"}
            </span>
          </div>
          <h1>{p.name}</h1>
          <Link className="text-link" href={`/category/${c.slug}`}>
            {c.name}
            <ArrowUpRight size={15} />
          </Link>
          <p>{p.description}</p>
          <div className="detail-pricing">
            <strong>{displayPrice(p) || "Live pricing not connected"}</strong>
            <span>
              We show prices only when the source and display permissions are
              verified.
            </span>
          </div>
          <SaveButton full id={p.id} name={p.name} />
          <MerchantLink product={p} />
          <div className="unavailable">
            <Info size={18} />
            <div>
              <strong>No purchase link available.</strong>
              <p>
                This demo has no authorized retailer offer. OofCourse does not
                sell or ship products.
              </p>
            </div>
          </div>
          <h2 className="small-heading">A few things to consider</h2>
          <ul className="feature-list">
            {p.features.map((f) => (
              <li key={f}>
                <Check size={16} />
                {f}
              </li>
            ))}
          </ul>
          <dl className="detail-facts">
            <div>
              <dt>Retailer organization</dt>
              <dd>{p.merchant} · Demo only</dd>
            </div>
            <div>
              <dt>Actual last verification</dt>
              <dd>Not checked — no live source</dd>
            </div>
            <div>
              <dt>Price / availability</dt>
              <dd>Not connected</dd>
            </div>
            <div>
              <dt>Content source</dt>
              <dd>Original OofCourse concept</dd>
            </div>
            <div>
              <dt>Promotion deadline</dt>
              <dd>None claimed</dd>
            </div>
          </dl>
          <p className="detail-disclosure">
            <ShieldCheck size={16} />
            Future qualifying affiliate links may earn us a commission. No
            affiliate enrollment is claimed.{" "}
            <Link href="/affiliate-disclosure">Read disclosure</Link>.
          </p>
        </div>
      </div>
      <section className="section">
        <SectionHeading
          title="A few more you might like."
          href={`/category/${c.slug}`}
          link="Explore the category"
        />
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .sort(
              (a, b) =>
                Number(b.category === p.category) -
                Number(a.category === p.category),
            )
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
