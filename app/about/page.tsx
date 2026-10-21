import Link from "next/link";
import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "About Us",
    "Meet OofCourse: an independent discovery website built around useful finds, clear information, and thoughtful everyday shopping.",
    "/about",
  );
export default function About() {
  return (
    <Information
      eyebrow="GOOD FINDS. CLEAR INTENTIONS."
      title="A little more thoughtful."
    >
      <p>
        Great Deals? Of Course! We’re building OofCourse for people who love
        finding something useful — and love it even more when it costs a little
        less.
      </p>
      <h2>Less noise. More everyday value.</h2>
      <p>
        Our goal is to help US shoppers discover useful things across tech,
        home, travel, and wellness. Clear product information and transparent
        affiliate relationships are part of that goal.
      </p>
      <h2>Where we are today</h2>
      <p>
        This is our Phase 1 demonstration website. Every product is an original
        concept illustration with fictional example prices. We have not
        connected live merchant offers, Amazon’s API, customer ratings, or a
        checkout.
      </p>
      <h2>How we plan to earn</h2>
      <p>
        In the future, qualifying purchases through clearly marked affiliate
        links may earn us a commission. That relationship will always be
        disclosed. No such purchasing links are active in this demo.
      </p>
      <p>
        Read our <Link href="/affiliate-disclosure">affiliate disclosure</Link>{" "}
        or <Link href="/deals">explore the demo collection</Link>.
      </p>
    </Information>
  );
}
