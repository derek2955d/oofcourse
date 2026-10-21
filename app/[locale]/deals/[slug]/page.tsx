import Link from "@/components/localized-link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Info } from "lucide-react";
import { products, categories, displayPrice } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";
import {
  categoryName,
  productName,
  productDescription,
  featureText,
} from "@/lib/i18n/catalog";
import { t } from "@/lib/i18n/messages";
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
  const l = await getLocale(),
    { slug } = await params,
    p = products.find((p) => p.slug === slug);
  return metadata(
    p ? `${productName(p, l)} · ${t(l, "demo")}` : t(l, "notFound"),
    p ? productDescription(p, l) : t(l, "notFoundText"),
    `/deals/${slug}`,
    true,
  );
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const l = await getLocale(),
    { slug } = await params,
    p = products.find((p) => p.slug === slug);
  if (!p) notFound();
  const c = categories.find((c) => c.slug === p.category)!;
  return (
    <div className="container page">
      <nav
        className="breadcrumbs"
        aria-label={l === "zh" ? "面包屑导航" : "Breadcrumb"}
      >
        <Link href="/">{t(l, "home")}</Link>
        <span>/</span>
        <Link href={`/category/${c.slug}`}>{categoryName(c, l)}</Link>
      </nav>
      <div className="detail-grid">
        <div>
          <div className="detail-image" style={{ background: p.color }}>
            <span className="demo-pill">{t(l, "demo")}</span>
            <Image
              src={p.imageUrl}
              alt={productName(p, l)}
              width={600}
              height={484}
              priority
            />
          </div>
          <p className="image-credit">{t(l, "imageCredit")}</p>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{categoryName(c, l)}</p>
          <h1>{productName(p, l)}</h1>
          <p>{productDescription(p, l)}</p>
          <div className="detail-pricing">
            <strong>{displayPrice(p) || t(l, "priceUnavailable")}</strong>
          </div>
          <SaveButton full id={p.id} name={productName(p, l)} />
          <MerchantLink product={p} />
          <div className="unavailable">
            <Info size={18} />
            <div>
              <strong>{t(l, "noOffer")}</strong>
              <p>{t(l, "noOfferText")}</p>
            </div>
          </div>
          <h2 className="small-heading">{t(l, "considerations")}</h2>
          <ul className="feature-list">
            {featureText(p, l).map((f) => (
              <li key={f}>
                <Check size={16} />
                {f}
              </li>
            ))}
          </ul>
          <dl className="detail-facts">
            <div>
              <dt>{t(l, "merchant")}</dt>
              <dd>
                <RetailerBadge retailer={p.retailer} />
              </dd>
            </div>
            <div>
              <dt>{t(l, "verifiedAt")}</dt>
              <dd>{t(l, "notChecked")}</dd>
            </div>
            <div>
              <dt>{t(l, "source")}</dt>
              <dd>{t(l, "originalSource")}</dd>
            </div>
          </dl>
          <p className="detail-disclosure">
            <Link href="/affiliate-disclosure">{t(l, "disclosure")}</Link> ·{" "}
            {t(l, "affiliateShort")}
          </p>
        </div>
      </div>
      <section className="section">
        <SectionHeading title={t(l, "related")} href={`/category/${c.slug}`} />
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
