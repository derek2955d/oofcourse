"use client";
import Link from "./localized-link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { guides, type Guide } from "@/lib/guides";
import { localizeGuide } from "@/lib/i18n/guides";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n/messages";
export function GuideCards({
  items = guides.slice(0, 3),
}: {
  items?: Guide[];
}) {
  const l = useLocale();
  return (
    <div className="guide-grid">
      {items.map((item) => {
        const g = localizeGuide(item, l);
        return (
          <article className="guide-card" key={g.slug}>
            <Link
              className="guide-image"
              aria-label={g.title}
              href={`/guides/${g.slug}`}
              style={{ background: g.color }}
            >
              <Image
                src={`/illustrations/${g.image}.svg`}
                alt=""
                width={360}
                height={220}
              />
            </Link>
            <div className="guide-body">
              <p className="eyebrow">{g.tag}</p>
              <h3>
                <Link href={`/guides/${g.slug}`}>{g.title}</Link>
              </h3>
              <Link href={`/guides/${g.slug}`} className="text-link">
                {t(l, "readGuide")}
                <ArrowUpRight size={15} />
                <span className="read-time">{g.readTime}</span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
