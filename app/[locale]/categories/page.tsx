import Link from "@/components/localized-link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";
import { CategoryIcon } from "@/components/icons";
import { getLocale } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/catalog";
import { t } from "@/lib/i18n/messages";
import { metadata } from "@/lib/seo";
export async function generateMetadata() {
  const l = await getLocale();
  return metadata(t(l, "categories"), t(l, "browseIntro"), "/categories");
}
export default async function Categories() {
  const l = await getLocale();
  return (
    <div className="container page">
      <h1 className="page-title">{t(l, "allCategories")}</h1>
      <div className="category-directory">
        {categories.map((c) => (
          <Link
            href={`/category/${c.slug}`}
            key={c.slug}
            className="category-directory-card"
          >
            <span className="category-icon" style={{ background: c.color }}>
              <CategoryIcon name={c.icon} size={30} />
            </span>
            <h2>{categoryName(c, l)}</h2>
            <span className="text-link">
              {t(l, "explore")}
              <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
