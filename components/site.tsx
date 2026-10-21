import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight, ShieldCheck, Info } from "lucide-react";
import {
  categories,
  Product,
  safeAffiliateUrl,
  displayPrice,
} from "@/lib/data";
import { SaveButton } from "./saved";
import { Brand } from "./header";
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <Info size={15} />
      <span>
        <strong>A little transparency:</strong> You’re browsing demo concepts.
        No live prices, verified offers, or buying links.
      </span>
      <Link href="/affiliate-disclosure">
        How it works <ArrowUpRight size={13} />
      </Link>
    </div>
  );
}
export function RetailerBadge({ retailer }: { retailer: string }) {
  return (
    <span className={`retailer-badge ${retailer}`}>
      <span className="retailer-dot" />
      {retailer === "amazon" ? "Amazon" : "Walmart"}
      <span className="retailer-demo"> · Demo</span>
    </span>
  );
}
export function MerchantLink({ product: p }: { product: Product }) {
  const url = safeAffiliateUrl(p);
  return url ? (
    <div className="merchant-link">
      <a
        href={url}
        rel="sponsored nofollow noopener noreferrer"
        target="_blank"
        className="button primary"
      >
        View at {p.merchant}
        <ArrowUpRight size={17} />
      </a>
      <small>
        Affiliate link. We may earn a commission on qualifying purchases.
      </small>
    </div>
  ) : null;
}
export function ProductCard({ product: p }: { product: Product }) {
  const price = displayPrice(p);
  return (
    <article className="product-card">
      <div className="product-visual" style={{ backgroundColor: p.color }}>
        <Link href={`/deals/${p.slug}`} className="product-image">
          <span className="demo-pill">DEMO CONCEPT</span>
          <Image
            src={p.imageUrl}
            alt={`Original concept illustration of ${p.name}`}
            width={360}
            height={290}
          />
        </Link>
        <SaveButton id={p.id} name={p.name} />
      </div>
      <div className="product-body">
        <div className="product-meta">
          <span>{categories.find((c) => c.slug === p.category)?.name}</span>
          <span className="status-label">
            {p.status === "expired" ? "Expired demo" : "Not verified"}
          </span>
        </div>
        <h3>
          <Link href={`/deals/${p.slug}`}>{p.name}</Link>
        </h3>
        <RetailerBadge retailer={p.retailer} />
        <div className="product-bottom">
          <span className="price-note">{price || "Price not connected"}</span>
          <Link
            href={`/deals/${p.slug}`}
            className="card-details"
            aria-label={`Details for ${p.name}`}
          >
            Details <ArrowRight size={14} />
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
  link = "Explore all finds",
  description,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  link?: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
export function Newsletter() {
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">A LITTLE GOOD IN YOUR INBOX</p>
        <h2>Less searching. More finding.</h2>
        <p>We’re putting together something useful. No inbox clutter.</p>
      </div>
      <div className="newsletter-placeholder">
        <span className="coming-soon">
          The good-finds newsletter · Coming soon
        </span>
        <small>We aren’t collecting email addresses yet.</small>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Brand />
            <p className="footer-slogan">Great Deals? Of Course!</p>
            <p>
              Thoughtful finds for real life.
              <br />
              An independent shopping discovery website.
            </p>
            <span className="independent-badge">
              <ShieldCheck size={15} />
              Transparency, always.
            </span>
          </div>
          <div>
            <strong>Discover</strong>
            <Link href="/deals">All finds</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/stores">Stores</Link>
            <Link href="/guides">Buying guides</Link>
            <Link href="/saved">Saved finds</Link>
          </div>
          <div>
            <strong>Explore categories</strong>
            {categories.slice(0, 4).map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}>
                {c.name}
              </Link>
            ))}
            <Link href="/categories">View all categories</Link>
          </div>
          <div>
            <strong>Here to help</strong>
            <Link href="/about">About us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
            <Link href="/terms">Terms of use</Link>
          </div>
        </div>
        <div className="affiliate-note">
          OofCourse does not sell products, process payments, or handle shipping
          and returns. Amazon and Walmart are independent retailers; their names
          here identify demo organization only. No affiliate enrollment,
          retailer partnership, or live offer is claimed. Future approved
          affiliate links will be clearly disclosed.{" "}
          <Link href="/affiliate-disclosure">Read our full disclosure.</Link>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} OofCourse. Thoughtfully built for the
            everyday.
          </span>
          <div>
            <Link href="/privacy">Your privacy</Link>
            <Link href="/admin">Admin</Link>
            <span>US · English</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
