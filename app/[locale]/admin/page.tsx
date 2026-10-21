import { getLocale } from "@/lib/i18n/server";
import { metadata } from "@/lib/seo";
import { databaseConfigured, requireAdmin } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLogin } from "@/components/admin-login";
import type { AdminRecords, DemoRecord } from "@/lib/admin-demo";
export const dynamic = "force-dynamic";
export const generateMetadata = async () =>
  metadata(
    (await getLocale()) === "zh" ? "管理工作区" : "Admin Workspace",
    "Secure administration preparation and clearly labeled browser-only demo workspace.",
    "/admin",
    true,
  );
async function loadAdminRecords(): Promise<AdminRecords | null> {
  try {
    const client = await requireAdmin();
    const entities = [
      "products",
      "offers",
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
                typeof v === "string" ||
                typeof v === "number" ||
                typeof v === "boolean" ||
                v === null,
            ),
          ) as DemoRecord,
      );
    return records;
  } catch {
    return null;
  }
}
export default async function Admin() {
  const locale = await getLocale();
  const configured = databaseConfigured();
  if (configured) {
    const records = await loadAdminRecords();
    if (records) {
      return (
        <div className="container page admin-page">
          <p className="eyebrow">
            {locale === "zh" ? "OOFCOURSE 管理" : "OOFCOURSE OPERATIONS"}
          </p>
          <h1 className="page-title">
            {locale === "zh" ? "让管理有条不紊。" : "A thoughtful workspace."}
          </h1>
          <AdminDashboard live initialRecords={records} />
        </div>
      );
    }
    return (
      <div className="container page">
        <p className="eyebrow">
          {locale === "zh" ? "仅限授权访问" : "AUTHORIZED ACCESS ONLY"}
        </p>
        <h1 className="page-title">
          {locale === "zh" ? "管理员登录。" : "Administrator sign-in."}
        </h1>
        <p className="page-intro">
          {locale === "zh"
            ? "请使用已授予管理员权限的账号登录。若已登录但数据结构尚未准备好，请先在开发数据库执行已审核的迁移。"
            : "Sign in with a provisioned administrator account. Apply the reviewed migrations before using connected administration."}
        </p>
        <AdminLogin />
      </div>
    );
  }
  return (
    <div className="container page admin-page">
      <p className="eyebrow">
        {locale === "zh"
          ? "OOFCOURSE 管理 · 演示模式"
          : "OOFCOURSE OPERATIONS · DEMONSTRATION"}
      </p>
      <h1 className="page-title">
        {locale === "zh" ? "让管理有条不紊。" : "A thoughtful workspace."}
      </h1>
      <p className="page-intro">
        {locale === "zh"
          ? "Supabase 尚未连接。本地演示记录仅保存在当前浏览器，不会发布到网站。真实登录需要配置开发数据库及管理员账号。"
          : "Supabase is not connected. Local demo edits stay in this browser and never publish. Real sign-in requires a configured database and provisioned administrator."}
      </p>
      <AdminDashboard />
    </div>
  );
}
