import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { categories, money, Product } from "@/lib/data";
export function DemoNotice() {
  return (
    <div className="demo-notice">
      <Sparkles size={14} />
      <span>
        <strong>You’re exploring a demo.</strong> All products, prices, and
        savings are illustrative. No live offers or purchases.
      </span>
      <Link href="/affiliate-disclosure">
        Learn more <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
export function ProductCard({ product: p }: { product: Product }) {
  return (
    <article className="product-card">
      <Link
        href={`/deals/${p.slug}`}
        className="product-image"
        style={{ backgroundColor: p.color }}
      >
        <span className="discount">
          {p.status === "expired"
            ? "EXPIRED DEMO"
            : `−${p.discountPercentage}% DEMO`}
        </span>
        <Image
          src={p.imageUrl}
          alt={`Original concept illustration of ${p.name}`}
          width={320}
          height={260}
        />
        <span className="image-arrow">
          <ArrowUpRight size={17} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{categories.find((c) => c.slug === p.category)?.name}</span>
        <span>Demo listing</span>
      </div>
      <h3>
        <Link href={`/deals/${p.slug}`}>{p.name}</Link>
      </h3>
      <p className="product-price">
        {money(p.currentPrice)} <del>{money(p.originalPrice)}</del>
        <span>Example price</span>
      </p>
    </article>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  href,
  link = "View all deals",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
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
        <p className="eyebrow">THE GOOD-FINDS CLUB</p>
        <h2>A better kind of inbox.</h2>
        <p>Thoughtful finds. Fresh inspiration. Zero noise.</p>
      </div>
      <div className="newsletter-placeholder">
        <div>
          <span>Something good is on its way</span>
          <span className="coming-soon">
            Coming soon <ArrowUpRight size={14} />
          </span>
        </div>
        <small>
          Newsletter preview only. We aren’t collecting email addresses.
        </small>
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
            <Link href="/" className="brand">
              OofCourse<span className="brand-period">.</span>
            </Link>
            <p>Great Deals? Of Course!</p>
            <p className="footer-description">
              A thoughtful place to discover your next everyday favorite.
            </p>
          </div>
          <div>
            <strong>Discover</strong>
            <Link href="/deals">All deals</Link>
            <Link href="/category/tech">Tech & Electronics</Link>
            <Link href="/category/home">Home & Kitchen</Link>
          </div>
          <div>
            <strong>OofCourse</strong>
            <Link href="/about">Our story</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          </div>
          <div className="footer-promise">
            <ShieldCheck size={26} />
            <strong>Transparency comes first.</strong>
            <p>
              Demo listings today. Clear, independent recommendations always.
            </p>
          </div>
        </div>
        <div className="affiliate-note">
          As an Amazon Associate I earn from qualifying purchases. This
          statement is reserved for future qualifying affiliate links; no Amazon
          API or live affiliate offers are connected in this demo. OofCourse is
          independently operated and is not affiliated with or endorsed by
          Amazon.
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} OofCourse. All rights reserved.
          </span>
          <div>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/admin">Admin</Link>
            <span>
              Made for the everyday <Check size={13} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
