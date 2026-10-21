import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { guides, type Guide } from "@/lib/guides";
export function GuideCards({
  items = guides.slice(0, 3),
}: {
  items?: Guide[];
}) {
  return (
    <div className="guide-grid">
      {items.map((g) => (
        <article className="guide-card" key={g.slug}>
          <Link
            href={`/guides/${g.slug}`}
            className="guide-image"
            style={{ background: g.color }}
          >
            <Image
              src={`/illustrations/${g.image}.svg`}
              alt=""
              width={360}
              height={220}
            />
            <span className="guide-tag">THE EVERYDAY GUIDE</span>
          </Link>
          <div className="guide-body">
            <span className="eyebrow">{g.tag}</span>
            <h3>
              <Link href={`/guides/${g.slug}`}>{g.title}</Link>
            </h3>
            <p>{g.intro}</p>
            <Link className="text-link" href={`/guides/${g.slug}`}>
              Read the guide <ArrowUpRight size={16} />
              <span className="read-time">{g.readTime}</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
