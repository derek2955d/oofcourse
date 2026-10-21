import { ShieldCheck } from "lucide-react";
import { Information } from "@/components/information";
import { metadata } from "@/lib/seo";
export const generateMetadata = () =>
  metadata(
    "Admin — Unavailable",
    "Administration is not enabled in the OofCourse demo.",
    "/admin",
    true,
  );
export default function Admin() {
  return (
    <Information
      eyebrow="PRIVATE OPERATIONS · PHASE 1"
      title="A safe place to start."
    >
      <div className="info-box">
        <ShieldCheck size={30} />
        <h2>Administration is not enabled.</h2>
        <p>
          This is a public, read-only placeholder. It contains no product
          editor, publishing controls, credentials, protected data, or mutation
          endpoints.
        </p>
      </div>
      <p>
        Future administration will require verified authentication, explicit
        administrator authorization, server-side validation, and database Row
        Level Security before any write operations are introduced.
      </p>
    </Information>
  );
}
