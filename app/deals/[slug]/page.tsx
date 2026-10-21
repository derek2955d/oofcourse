export const dynamicParams = false;
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { products, categories, money, safeAffiliateUrl } from "@/lib/data";
import { metadata } from "@/lib/seo";
import { ProductCard, SectionHeading } from "@/components/site";
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
    p ? `${p.name} — Demo Listing` : "Find not found",
    p
      ? `${p.name}: an illustrative OofCourse concept, not a live offer. No purchases are available.`
      : "This demo listing could not be found.",
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
  const affiliateUrl = safeAffiliateUrl(p);
  return (
    <div className="container page">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href={`/category/${c.slug}`}>{c.name}</Link>
        <span>/</span>
        <span>Demo find</span>
      </nav>
      <div className="detail-grid">
        <div className="detail-image" style={{ background: p.color }}>
          <span className="discount">ORIGINAL DEMO CONCEPT</span>
          <Image
            src={p.imageUrl}
            alt={`Original illustration of ${p.name}`}
            width={600}
            height={484}
            priority
          />
        </div>
        <div className="detail-copy">
          <span className="pill">
            {p.status === "expired"
              ? "EXPIRED DEMO · NOT AVAILABLE"
              : "DEMO LISTING · NOT A LIVE OFFER"}
          </span>
          <h1>{p.name}</h1>
          <Link className="text-link" href={`/category/${c.slug}`}>
            {c.name}
          </Link>
          <p>{p.description}</p>
          <div className="detail-price">
            {money(p.currentPrice)}
            <del>{money(p.originalPrice)}</del>
          </div>
          <small>
            Illustrative price · {p.discountPercentage}% example savings · Not
            verified merchant pricing
          </small>
          {affiliateUrl ? (
            <>
              <a
                href={affiliateUrl}
                rel="sponsored nofollow noopener noreferrer"
                target="_blank"
                className="button primary"
              >
                View at merchant ↗
              </a>
              <p>
                Affiliate link: we may earn a commission from qualifying
                purchases.
              </p>
            </>
          ) : (
            <div className="unavailable">
              <strong>No purchase link available.</strong>
              <br />
              This is a demo concept. No affiliate URL, inventory, reviews, or
              live merchant offer is configured.
            </div>
          )}
          <dl className="detail-facts">
            <div>
              <dt>Source</dt>
              <dd>{p.merchant} · No Amazon API connection</dd>
            </div>
            <div>
              <dt>Record created</dt>
              <dd>{p.createdAt.slice(0, 10)} (demo)</dd>
            </div>
            <div>
              <dt>Example expiration</dt>
              <dd>{p.expiresAt.slice(0, 10)} (demo)</dd>
            </div>
            <div>
              <dt>Example last check</dt>
              <dd>{p.lastCheckedAt.slice(0, 10)} · Not a live check</dd>
            </div>
          </dl>
          <p>
            <Link className="text-link" href="/affiliate-disclosure">
              Read our affiliate disclosure →
            </Link>
          </p>
        </div>
      </div>
      <section className="section">
        <SectionHeading title="A few more good finds." href="/deals" />
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 4)
            .map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
        </div>
      </section>
    </div>
  );
}
