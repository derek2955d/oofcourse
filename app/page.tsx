import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  BadgeCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { categories, products } from "@/lib/data";
import { Newsletter, ProductCard, SectionHeading } from "@/components/site";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Great Deals? Of Course!",
    "Thoughtful finds for everyday living. Explore demo deals in tech, home, travel, and wellness.",
    "/",
  );
export default function Home() {
  return (
    <div className="container home">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-dot" /> GOOD FINDS. GREAT FEELING.
          </p>
          <h1>
            Your next favorite.
            <br />
            For a little <span>less.</span>
            <svg viewBox="0 0 230 18" aria-hidden="true">
              <path
                d="M3 13 Q110 -3 224 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>
          </h1>
          <p>
            Life’s full of good things. We help you find the ones
            <br className="desktop-break" /> worth bringing home — without the
            full price.
          </p>
          <div className="hero-actions">
            <Link href="/deals" className="button primary">
              Discover the finds <ArrowUpRight size={18} />
            </Link>
            <span>Good taste. Better prices.</span>
          </div>
          <div className="hero-proof">
            <span>
              <BadgeCheck size={16} /> Thoughtfully curated
            </span>
            <span>
              <Sparkles size={16} /> Always transparent
            </span>
          </div>
        </div>
        <div className="hero-art">
          <span className="hero-orbit orbit-one" />
          <span className="hero-orbit orbit-two" />
          <div className="hero-label">
            THE EVERYDAY EDIT <span>01 / 04</span>
          </div>
          <Image
            className="hero-headphones"
            src="/illustrations/headphones.svg"
            alt="Original illustration of sage green wireless headphones"
            width={440}
            height={350}
            priority
          />
          <div className="hero-sticker">
            GOOD
            <br />
            FINDS<span>✳</span>
          </div>
          <div className="hero-float">
            <span className="tiny-dot" /> A little upgrade, a better everyday.
          </div>
          <div className="hero-caption">
            <span>
              Sound good? <strong>Of course.</strong>
            </span>
            <Link
              href={`/deals/${products[0].slug}`}
              aria-label="Explore demo headphones"
            >
              <ArrowUpRight size={25} />
            </Link>
          </div>
        </div>
      </section>
      <section className="value-strip" aria-label="Our approach">
        <span>
          <Search size={19} />
          <strong>We do the discovering.</strong> You do the enjoying.
        </span>
        <span>
          <BadgeCheck size={19} /> Independent picks. Clear information.
        </span>
        <span>
          <Sparkles size={19} /> Little upgrades. Everyday happiness.
        </span>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="THE SHORTLIST"
          title="Good finds, right now."
          href="/deals"
        />
        <div className="product-grid">
          {products
            .filter((p) => p.featured)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="categories-section">
        <SectionHeading
          eyebrow="FIND YOUR KIND OF GOOD"
          title="A little something for every day."
        />
        <div className="category-grid">
          {categories.map((c, i) => (
            <Link
              href={`/category/${c.slug}`}
              className={`category-tile category-${i}`}
              key={c.slug}
            >
              <span className="category-symbol">{c.icon}</span>
              <div>
                <h3>{c.name}</h3>
                <p>{c.description}</p>
              </div>
              <ArrowUpRight size={21} />
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="WORTH A SECOND LOOK"
          title="The everyday favorites."
          href="/deals?sort=savings"
          link="Explore the edit"
        />
        <div className="product-grid">
          {products
            .filter((p) => p.trending)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="editorial">
        <div className="editorial-art">
          <span>
            less scrolling.
            <br />
            <em>more finding.</em>
          </span>
          <span className="editorial-star">✳</span>
        </div>
        <div>
          <p className="eyebrow">A LITTLE MORE INTENTIONAL</p>
          <h2>
            Good deals.
            <br />
            Even better decisions.
          </h2>
          <p>
            We believe a great find should make your day better. So we’re
            building a place for useful things, honest information, and a little
            joy in the everyday.
          </p>
          <Link href="/about" className="text-link">
            Get to know OofCourse <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section">
        <SectionHeading
          eyebrow="FRESH ON THE SHELF"
          title="Recently discovered."
          href="/deals?sort=newest"
        />
        <div className="product-grid">
          {products.slice(8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <Newsletter />
    </div>
  );
}
