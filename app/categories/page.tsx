import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/lib/data";
import { CategoryIcon } from "@/components/icons";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Browse Categories",
    "Find thoughtful ideas for home, electronics, kids, baby, personal care, outdoors, pets, and everyday essentials.",
    "/categories",
  );
export default function Categories() {
  return (
    <div className="container page">
      <p className="eyebrow">A LITTLE SOMETHING FOR EVERYDAY LIFE</p>
      <h1 className="page-title">What’s on your list?</h1>
      <p className="page-intro">
        Eight ways to find something useful. Every current listing is a demo
        concept.
      </p>
      <div className="category-directory">
        {categories.map((c) => (
          <Link
            href={`/category/${c.slug}`}
            key={c.slug}
            className="category-directory-card"
          >
            <span className="category-icon" style={{ background: c.color }}>
              <CategoryIcon name={c.icon} size={32} />
            </span>
            <h2>{c.name}</h2>
            <p>{c.description}</p>
            <span className="text-link">
              Explore category
              <ArrowUpRight size={17} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
