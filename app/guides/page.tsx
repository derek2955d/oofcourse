import { GuideCards } from "@/components/guides";
import { guides } from "@/lib/guides";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Buying Guides",
    "Original, practical shopping guides for kitchens, smart homes, family shopping, small spaces, and seasonal planning.",
    "/guides",
  );
export default function Guides() {
  return (
    <div className="container page">
      <p className="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</p>
      <h1 className="page-title">Good ideas. Thoughtful choices.</h1>
      <p className="page-intro">
        Original guides for everyday decisions. Practical considerations,
        without invented product tests or rankings.
      </p>
      <h2 className="sr-only">Original buying guides</h2>
      <GuideCards items={guides} />
    </div>
  );
}
