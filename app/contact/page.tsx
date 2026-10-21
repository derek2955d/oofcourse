import Link from "next/link";
import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Contact",
    "Contact information and support availability for the OofCourse demonstration website.",
    "/contact",
  );
export default function Contact() {
  return (
    <Information eyebrow="LET’S KEEP THINGS CLEAR" title="Say hello. Soon.">
      <p>
        We’re preparing a dedicated support channel for OofCourse. No contact
        form, support inbox, or message collection is connected in this demo.
      </p>
      <div className="info-box">
        <strong>Contact channel coming soon</strong>
        <p>
          Please don’t submit personal information through this preview. A
          verified contact method will be published here before live affiliate
          operations begin.
        </p>
      </div>
      <h2>Questions about an order?</h2>
      <p>
        OofCourse does not sell products or process payments. When live offers
        become available, purchases and customer service will be handled by the
        merchant. There are no purchasable offers in this demo.
      </p>
      <p>
        For now, read <Link href="/about">our story</Link>,{" "}
        <Link href="/privacy">privacy information</Link>, or the{" "}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link>.
      </p>
    </Information>
  );
}
