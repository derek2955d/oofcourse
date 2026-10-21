import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Heart,
  ShoppingBag,
  Check,
} from "lucide-react";
import { categories, products } from "@/lib/data";
import { Newsletter, ProductCard, SectionHeading } from "@/components/site";
import { CategoryIcon } from "@/components/icons";
import { StoreCards } from "@/components/stores";
import { GuideCards } from "@/components/guides";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Family-friendly finds for real life",
    "Discover useful products, smart savings, and everyday favorites from retailers you know. Explore the OofCourse multi-retailer demo.",
    "/",
  );
export default function Home() {
  return (
    <>
      <div className="container home">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="green-dot" /> A LITTLE MORE GOOD IN YOUR EVERYDAY
            </p>
            <h1>
              Family-friendly finds
              <br className="wide-break" /> for <span>real life.</span>
            </h1>
            <p>
              Discover useful products, smart savings, and everyday favorites
              from retailers you know.
            </p>
            <form action="/search" role="search" className="hero-search">
              <Search size={21} />
              <input
                name="q"
                type="search"
                aria-label="Search family finds"
                placeholder="What would make your day a little easier?"
                maxLength={200}
              />
              <button aria-label="Search family finds" type="submit">
                <ArrowRight size={22} />
              </button>
            </form>
            <div className="popular-searches">
              <span>A few ideas:</span>
              <Link href="/category/home">Kitchen essentials</Link>
              <Link href="/category/toys">Kids & play</Link>
              <Link href="/category/essentials">Everyday basics</Link>
            </div>
            <div className="hero-proof">
              <span>
                <Check size={15} />
                Useful by nature
              </span>
              <span>
                <Check size={15} />
                Independent by choice
              </span>
            </div>
          </div>
          <div className="hero-art">
            <Image
              src="/images/family-kitchen.webp"
              alt="Original AI-generated lifestyle scene of a family preparing breakfast in a bright kitchen"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className="hero-image-label">
              <span className="green-dot" />
              FOR THE LITTLE MOMENTS THAT MATTER
            </div>
            <div className="hero-note">
              <span className="hero-note-icon">
                <Heart size={21} />
              </span>
              <div>
                <strong>Good finds. Happier everyday.</strong>
                <span>A little less searching. A little more living.</span>
              </div>
            </div>
          </div>
        </section>
        <div className="value-strip">
          <span>
            <ShieldCheck size={19} />
            <strong>Independent & transparent</strong>
          </span>
          <span>
            <ShoppingBag size={19} />
            Familiar retailers. Thoughtful discovery.
          </span>
          <span>
            <Heart size={19} />
            Made for your everyday
          </span>
        </div>
        <section className="section category-section">
          <SectionHeading
            title="What’s on your list?"
            description="Find a little something for every corner of life."
            href="/categories"
            link="All categories"
          />
          <div className="category-grid">
            {categories.map((c) => (
              <Link
                className="category-tile"
                href={`/category/${c.slug}`}
                key={c.slug}
              >
                <span className="category-icon" style={{ background: c.color }}>
                  <CategoryIcon name={c.icon} />
                </span>
                <h3>{c.name}</h3>
              </Link>
            ))}
          </div>
        </section>
        <section className="section">
          <SectionHeading
            eyebrow="THE EVERYDAY EDIT"
            title="Good finds for busy lives."
            description="A few useful ideas, picked with real life in mind."
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
        <section className="section store-section">
          <SectionHeading
            title="Familiar stores. Fresh discoveries."
            description="Your favorite places to shop, brought a little closer."
            href="/stores"
            link="Explore stores"
          />
          <StoreCards />
        </section>
      </div>
      <section className="family-banner">
        <div className="container banner-inner">
          <div>
            <p className="eyebrow">SMARTER SHOPPING STARTS HERE</p>
            <h2>
              Big on useful.
              <br />
              Little on unnecessary.
            </h2>
            <p>
              A home that works for you. Things your family will actually use.
              <br />
              That’s our kind of good find.
            </p>
            <Link
              href="/guides/family-shopping-guides"
              className="button primary"
            >
              Find your shopping rhythm
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="banner-visual">
            <div className="banner-ring" />
            <Image
              src="/illustrations/tote.svg"
              alt="Original illustration of a reusable market tote"
              width={350}
              height={290}
            />
            <span className="banner-caption">
              <Check size={16} /> Made for the everyday
            </span>
          </div>
        </div>
      </section>
      <div className="container">
        <section className="section">
          <SectionHeading
            eyebrow="A LITTLE INSPIRATION"
            title="Helpful reads for thoughtful choices."
            description="Less guesswork. More confidence in your next find."
            href="/guides"
            link="All buying guides"
          />
          <GuideCards />
        </section>
        <section className="section">
          <SectionHeading
            eyebrow="FRESH PERSPECTIVES"
            title="A few more to explore."
            href="/deals?sort=newest"
          />
          <div className="product-grid">
            {products.slice(8, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
        <section className="our-promise">
          <ShieldCheck size={32} />
          <div>
            <h2>Good information comes first.</h2>
            <p>
              Demo concepts today. Clear sources, honest status, and properly
              disclosed links before any live offers tomorrow.
            </p>
          </div>
          <Link href="/affiliate-disclosure" className="text-link">
            Our approach
            <ArrowRight size={17} />
          </Link>
        </section>
        <Newsletter />
      </div>
    </>
  );
}
