import { metadata } from "@/lib/seo";
import { databaseConfigured, requireAdmin } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import type { AdminRecords, DemoRecord } from "@/lib/admin-demo";
export const dynamic = "force-dynamic";
export const generateMetadata = () =>
  metadata(
    "Admin Workspace",
    "Secure administration preparation and clearly labeled browser-only demo workspace.",
    "/admin",
    true,
  );
async function loadAdminRecords(): Promise<AdminRecords | null> {
  try {
    const client = await requireAdmin();
    const entities = [
      "products",
      "categories",
      "retailers",
      "affiliate_links",
      "deal_sources",
    ] as const;
    const result = await Promise.all(
      entities.map(async (entity) => {
        const { data, error } = await client
          .from(entity)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200);
        if (error) throw new Error("Database schema unavailable.");
        return [
          entity,
          data?.map((r) => ({
            ...r,
            ...(entity === "retailers"
              ? { allowed_hosts: (r.allowed_hosts || []).join(",") }
              : {}),
          })) || [],
        ] as const;
      }),
    );
    const records = Object.fromEntries(result) as unknown as AdminRecords;
    for (const key of entities)
      records[key] = records[key].map(
        (r: DemoRecord) =>
          Object.fromEntries(
            Object.entries(r).filter(
              ([, v]) =>
                typeof v === "string" || typeof v === "boolean" || v === null,
            ),
          ) as DemoRecord,
      );
    return records;
  } catch {
    return null;
  }
}
export default async function Admin() {
  const configured = databaseConfigured();
  if (configured) {
    const records = await loadAdminRecords();
    if (records) {
      return (
        <div className="container page admin-page">
          <p className="eyebrow">OOFCOURSE OPERATIONS</p>
          <h1 className="page-title">A thoughtful workspace.</h1>
          <AdminDashboard live initialRecords={records} />
        </div>
      );
    }
    return (
      <div className="container page">
        <p className="eyebrow">AUTHORIZED ACCESS ONLY</p>
        <h1 className="page-title">Administrator sign-in.</h1>
        <p className="page-intro">
          Sign in with a provisioned administrator account. If your session is
          valid but the schema is not ready, apply the reviewed migrations in
          your development project first.
        </p>
        <AdminLogin />
      </div>
    );
  }
  return (
    <div className="container page admin-page">
      <p className="eyebrow">OOFCOURSE OPERATIONS · DEMONSTRATION</p>
      <h1 className="page-title">A thoughtful workspace.</h1>
      <p className="page-intro">
        Supabase is not connected. This interactive sandbox stores edits only in
        your browser, separate from the public catalog. No authentication, live
        publishing, or real analytics is claimed.
      </p>
      <AdminDashboard />
    </div>
  );
}
