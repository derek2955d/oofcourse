import Link from "next/link";
import { ArrowRight, ShoppingBag, ArrowUpRight, Sparkles } from "lucide-react";
import { retailers } from "@/lib/data";
export function StoreCards() {
  return (
    <div className="store-grid">
      {retailers.map((r) => (
        <article className={`store-card ${r.slug}`} key={r.slug}>
          <div className="store-wordmark">
            {r.name}
            <span>
              {r.slug === "amazon" ? (
                <ArrowUpRight size={23} />
              ) : (
                <Sparkles size={23} />
              )}
            </span>
          </div>
          <p>Familiar retailer. A place for future finds.</p>
          <span className="store-status">Demo collection · No live offers</span>
          <Link href={`/stores/${r.slug}`} className="text-link">
            Browse demo collection
            <ArrowRight size={17} />
          </Link>
        </article>
      ))}
      <article className="store-card future-store">
        <ShoppingBag size={25} />
        <h3>More good places.</h3>
        <p>
          Target, Best Buy, and more may come later. No partnerships are
          currently claimed.
        </p>
        <span className="store-status">Future retailers · Coming later</span>
      </article>
    </div>
  );
}
