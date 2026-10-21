"use client";
import Link from "./localized-link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Info } from "lucide-react";
import {
  categories,
  retailers,
  type Product,
  safeAffiliateUrl,
  displayPrice,
} from "@/lib/data";
import { categoryName, productName } from "@/lib/i18n/catalog";
import { t } from "@/lib/i18n/messages";
import { useLocale } from "./locale-provider";
import { SaveButton } from "./saved";
import { Brand } from "./header";
export function DemoNotice() {
  const l = useLocale();
  return (
    <div className="demo-notice compact-demo">
      <Info size={13} />
      <span>{t(l, "demoNotice")}</span>
      <Link href="/affiliate-disclosure">{t(l, "learnMore")}</Link>
    </div>
  );
}
export function RetailerBadge({ retailer }: { retailer: string }) {
  const name = retailers.find((r) => r.slug === retailer)?.name || retailer;
  return <span className="retailer-label">{name}</span>;
}
export function MerchantLink({ product: p }: { product: Product }) {
  const l = useLocale(),
    url = safeAffiliateUrl(p);
  return url ? (
    <div className="merchant-link">
      <a
        href={url}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        className="button primary"
      >
        {t(l, "viewAt")} {p.merchant}
        <ArrowUpRight size={16} />
      </a>
      <small>{t(l, "affiliateShort")}</small>
    </div>
  ) : null;
}
export function ProductCard({ product: p }: { product: Product }) {
  const l = useLocale(),
    name = productName(p, l),
    price = displayPrice(p),
    category = categories.find((c) => c.slug === p.category);
  return (
    <article className="product-card">
      <div className="product-visual" style={{ backgroundColor: p.color }}>
        <Link className="product-image" href={`/deals/${p.slug}`}>
          <span className="demo-pill">{t(l, "demo")}</span>
          <Image src={p.imageUrl} alt={name} width={360} height={290} />
        </Link>
        <SaveButton id={p.id} name={name} />
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{category ? categoryName(category, l) : ""}</span>
          {p.status === "expired" && (
            <span className="status-label">{t(l, "expired")}</span>
          )}
        </div>
        <h3>
          <Link href={`/deals/${p.slug}`}>{name}</Link>
        </h3>
        <div className="product-bottom">
          <span className="product-value">
            {price || <RetailerBadge retailer={p.retailer} />}
          </span>
          <Link
            href={`/deals/${p.slug}`}
            className="card-details"
            aria-label={`${t(l, "viewDetails")}: ${name}`}
          >
            {t(l, "viewDetails")}
            <ArrowRight size={14} />
          </Link>
        </div>
        <MerchantLink product={p} />
      </div>
    </article>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  href,
  link,
  description,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  link?: string;
  description?: string;
}) {
  const l = useLocale();
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link || t(l, "viewAll")}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function Newsletter() {
  const l = useLocale();
  return (
    <section className="newsletter">
      <h2>{t(l, "newsletter")}</h2>
      <p>{t(l, "newsletterSoon")}</p>
    </section>
  );
}
export function Footer() {
  const l = useLocale();
  return (
    <footer className="footer simple-footer">
      <div className="container">
        <div className="simple-footer-main">
          <div>
            <Brand />
            <p>{t(l, "footerLine")}</p>
          </div>
          <nav aria-label={l === "zh" ? "页脚导航" : "Footer navigation"}>
            {(
              [
                ["/about", "about"],
                ["/contact", "contact"],
                ["/affiliate-disclosure", "disclosure"],
                ["/privacy", "privacy"],
                ["/terms", "terms"],
                ["/categories", "categories"],
                ["/stores", "stores"],
                ["/admin", "admin"],
              ] as const
            ).map(([href, key]) => (
              <Link key={href} href={href}>
                {t(l, key)}
              </Link>
            ))}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} OofCourse.</span>
          <p>{t(l, "footerDisclosure")}</p>
        </div>
      </div>
    </footer>
  );
}
