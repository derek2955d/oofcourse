import Link from "@/components/localized-link";
import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { categories, products, selectProducts } from "@/lib/data";
import { ProductCard, SectionHeading } from "@/components/site";
import { CategoryIcon } from "@/components/icons";
import { GuideCards } from "@/components/guides";
import { getLocale } from "@/lib/i18n/server";
import { categoryName, productName } from "@/lib/i18n/catalog";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(
    l === "zh" ? "好物好价？当然！" : "Great Deals? Of Course!",
    l === "zh"
      ? "OofCourse 独立综合购物发现平台，探索全品类好物与购物灵感。"
      : "Discover useful products and everyday favorites across categories and retailers.",
    "/",
  );
}
export default async function Home() {
  const l = await getLocale();
  const priority = [
    "tech",
    "home",
    "fashion",
    "beauty",
    "toys",
    "outdoors",
    "pets",
    "essentials",
  ];
  return (
    <div className="container discovery-home">
      <section className="discovery-hero">
        <div className="discovery-hero-copy">
          <p className="eyebrow">{t(l, "heroLabel")}</p>
          <h1>
            {t(l, "heroTitle")}
            <br />
            <span>{t(l, "heroAccent")}</span>
          </h1>
          <p>{t(l, "heroText")}</p>
          <Link href="/deals" className="button primary">
            {t(l, "explore")}
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="hero-product-edit">
          {[products[2], products[0], products[10]].map((p, i) => (
            <Link
              key={p.id}
              href={`/deals/${p.slug}`}
              className={`hero-product hero-product-${i}`}
              style={{ background: p.color }}
            >
              <span>{t(l, "demo")}</span>
              <Image
                src={p.imageUrl}
                alt={productName(p, l)}
                width={360}
                height={290}
                priority={i === 0}
              />
              <div>
                <strong>{productName(p, l)}</strong>
                <ArrowUpRight size={17} />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <nav className="shopping-category-strip" aria-label={t(l, "categories")}>
        {priority.map((slug) => {
          const c = categories.find((c) => c.slug === slug)!;
          return (
            <Link href={`/category/${c.slug}`} key={slug}>
              <CategoryIcon name={c.icon} size={19} />
              {categoryName(c, l)}
            </Link>
          );
        })}
        <Link href="/categories">
          {t(l, "moreCategories")}
          <ArrowRight size={15} />
        </Link>
      </nav>
      <section className="section">
        <SectionHeading title={t(l, "featured")} href="/deals" />
        <div className="product-grid">
          {products
            .filter((p) => p.featured)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading title={t(l, "today")} href="/deals?sort=name" />
        <div className="product-grid">
          {products.slice(8, 12).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading title={t(l, "recent")} href="/deals?sort=newest" />
        <div className="product-grid">
          {selectProducts({ sort: "newest" })
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <section className="section popular-category-section">
        <SectionHeading title={t(l, "popular")} href="/categories" />
        <div className="category-grid">
          {categories
            .filter((c) => priority.includes(c.slug))
            .map((c) => (
              <Link
                className="category-tile"
                href={`/category/${c.slug}`}
                key={c.slug}
              >
                <span className="category-icon" style={{ background: c.color }}>
                  <CategoryIcon name={c.icon} />
                </span>
                <h3>{categoryName(c, l)}</h3>
              </Link>
            ))}
        </div>
      </section>
      <section className="section buying-guides-section">
        <SectionHeading title={t(l, "guides")} href="/guides" />
        <GuideCards />
      </section>
    </div>
  );
}
