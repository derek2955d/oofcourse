import Link from "next/link";
export default function NotFound() {
  return (
    <div className="error-page">
      <p className="eyebrow" style={{ justifyContent: "center" }}>
        404 · A LITTLE OFF THE PATH
      </p>
      <h1>That find got away.</h1>
      <p>
        This page or demo listing doesn’t exist. There are more good finds to
        explore.
      </p>
      <Link className="button primary" href="/deals">
        Explore all finds
      </Link>
    </div>
  );
}
