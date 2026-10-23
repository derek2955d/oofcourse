import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { configured, requireAdmin } from "@/lib/supabase/server";
import { ConnectionNotice, StatusBadge } from "./ui";
import { LogoutButton } from "./account-controls";
import {
  ModerationControl,
  BulkModeration,
  ReferenceEditor,
  PostingSettings,
} from "./admin-controls";
import {
  LayoutDashboard,
  Files,
  UsersRound,
  Flag,
  Grid2X2,
  MapPin,
  Store,
  Sparkles,
  Settings,
  History,
  ShieldCheck,
} from "lucide-react";
const tabs = [
  ["overview", "adminOverview", LayoutDashboard],
  ["listings", "adminListings", Files],
  ["users", "adminUsers", UsersRound],
  ["reports", "adminReports", Flag],
  ["categories", "adminCategories", Grid2X2],
  ["locations", "adminLocations", MapPin],
  ["businesses", "adminBusinesses", Store],
  ["promotions", "adminPromotions", Sparkles],
  ["settings", "adminSettings", Settings],
  ["audit", "adminAudit", History],
] as const;
export async function AdminDashboard({
  section = "overview",
  query = {},
}: {
  section?: string;
  query?: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations(),
    l = await getLocale();
  let context;
  try {
    context = await requireAdmin();
  } catch {
    /* No database query or management control is rendered without a verified admin role. */
  }
  const active = tabs.find((x) => x[0] === section)?.[0] || "overview";
  let content: React.ReactNode;
  if (!context)
    content = (
      <>
        {!configured() && <ConnectionNotice />}
        <div className="surface centered">
          <ShieldCheck size={34} />
          <h2>{t("adminOnly")}</h2>
          <p>{t("adminOnlyText")}</p>
          <Link href="/login?next=/admin" className="button primary">
            {t("login")}
          </Link>
        </div>
      </>
    );
  else {
    const { db } = context;
    if (active === "overview") {
      const { data, error } = await db.rpc("admin_summary");
      const summary = data as {
        users: number;
        active: number;
        pending: number;
        reports: number;
        businesses: number;
        trend: { date: string; count: number }[];
      } | null;
      content =
        error || !summary ? (
          <p role="alert">{t("dataError")}</p>
        ) : (
          <>
            <div className="metric-grid">
              {[
                ["userCount", summary.users],
                ["activeCount", summary.active],
                ["pendingCount", summary.pending],
                ["reportCount", summary.reports],
                ["businessCount", summary.businesses],
              ].map(([key, value]) => (
                <div className="metric" key={key}>
                  <span>{t(String(key))}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="surface">
              <h3>{t("postingTrend")}</h3>
              <div className="trend-chart">
                {summary.trend.map((point) => (
                  <div key={point.date}>
                    <strong>{point.count}</strong>
                    <span
                      style={{
                        height:
                          Math.max(
                            2,
                            (point.count /
                              Math.max(
                                1,
                                ...summary.trend.map((p) => p.count),
                              )) *
                              100,
                          ) + "px",
                      }}
                    />
                    <small>
                      {new Date(point.date + "T12:00:00").toLocaleDateString(
                        l === "zh" ? "zh-CN" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
    } else if (active === "listings") {
      const status =
        typeof query.status === "string" &&
        [
          "draft",
          "pending",
          "approved",
          "rejected",
          "expired",
          "archived",
        ].includes(query.status)
          ? query.status
          : "pending";
      const keyword = typeof query.q === "string" ? query.q.slice(0, 100) : "";
      let request = db
        .from("listings")
        .select("*")
        .eq("status", status)
        .order("updated_at", { ascending: false })
        .limit(25);
      if (keyword) request = request.ilike("title", `%${keyword}%`);
      const { data, error } = await request;
      const { data: checks } = data?.length
        ? await db
            .from("listing_checks")
            .select("listing_id,flags,created_at")
            .in(
              "listing_id",
              data.map((r) => r.id),
            )
            .order("created_at", { ascending: false })
        : { data: [] };
      content = (
        <>
          <form className="admin-search" action={`/${l}/admin/listings`}>
            <label className="field">
              {t("keyword")}
              <input name="q" defaultValue={keyword} />
            </label>
            <label className="field">
              {t("status")}
              <select name="status" defaultValue={status}>
                {[
                  "pending",
                  "approved",
                  "rejected",
                  "expired",
                  "archived",
                  "draft",
                ].map((s) => (
                  <option value={s} key={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
            </label>
            <button className="button primary">{t("apply")}</button>
          </form>
          {error ? (
            <p role="alert">{t("dataError")}</p>
          ) : data?.length ? (
            <>
              <div className="record-list">
                {data.map((row) => (
                  <article className="record" key={row.id}>
                    <h3>{row.title || t("draft")}</h3>
                    <div className="table-actions" style={{ margin: "10px 0" }}>
                      <StatusBadge status={row.status} label={t(row.status)} />
                      <span className="status">{t(row.category_id)}</span>
                    </div>
                    <p>{row.description}</p>
                    <dl className="specs-grid" style={{ marginTop: 16 }}>
                      {Object.entries(row.details || {}).map(([key, value]) => (
                        <div key={key}>
                          <dt>{t.has(key) ? t(key) : key}</dt>
                          <dd>{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                    {checks?.find((c) => c.listing_id === row.id)?.flags
                      ?.length > 0 && (
                      <p className="notice error-notice">
                        {checks
                          ?.find((c) => c.listing_id === row.id)
                          ?.flags.map((flag: string) =>
                            t.has(flag) ? t(flag) : flag,
                          )
                          .join(" · ")}
                      </p>
                    )}
                    <div style={{ marginTop: 20 }}>
                      <ModerationControl kind="listing" id={row.id} />
                    </div>
                  </article>
                ))}
              </div>
              <BulkModeration ids={data.map((r) => r.id)} />
            </>
          ) : (
            <p className="surface">{t("noRecords")}</p>
          )}
        </>
      );
    } else if (active === "users") {
      const keyword = typeof query.q === "string" ? query.q.slice(0, 80) : "";
      let request = db
        .from("profiles")
        .select("id,display_name,posting_restricted,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (keyword) request = request.ilike("display_name", `%${keyword}%`);
      const { data, error } = await request;
      content = (
        <>
          <form className="admin-search" action={`/${l}/admin/users`}>
            <label className="field">
              {t("name")}
              <input name="q" defaultValue={keyword} />
            </label>
            <button className="button primary">{t("navSearch")}</button>
          </form>
          {error ? (
            <p role="alert">{t("dataError")}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("name")}</th>
                    <th>{t("status")}</th>
                    <th>{t("adminUsers")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((row) => (
                    <tr key={row.id}>
                      <td>{row.display_name}</td>
                      <td>
                        {t(row.posting_restricted ? "restricted" : "active")}
                      </td>
                      <td>
                        <ModerationControl
                          kind="user"
                          id={row.id}
                          restricted={row.posting_restricted}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      );
    } else if (active === "reports") {
      const { data, error } = await db
        .from("reports")
        .select("*,listings(title)")
        .order("created_at", { ascending: false })
        .limit(50);
      content = error ? (
        <p role="alert">{t("dataError")}</p>
      ) : data?.length ? (
        <div className="record-list">
          {data.map((row) => (
            <article className="record" key={row.id}>
              <h3>{row.listings?.title}</h3>
              <small>
                {t(row.reason === "privacy" ? "privacyReason" : row.reason)}
              </small>
              <p>{row.description}</p>
              {row.resolution && <p className="notice">{row.resolution}</p>}
              <div style={{ marginTop: 16 }}>
                <ModerationControl kind="report" id={row.id} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="surface">{t("noRecords")}</p>
      );
    } else if (active === "businesses") {
      const { data, error } = await db
        .from("business_profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      content = error ? (
        <p role="alert">{t("dataError")}</p>
      ) : data?.length ? (
        <div className="record-list">
          {data.map((row) => (
            <article className="record" key={row.id}>
              <h3>{row.name}</h3>
              <p>{row.description}</p>
              <div className="table-actions" style={{ marginTop: 16 }}>
                <StatusBadge status={row.status} label={t(row.status)} />
                <ModerationControl kind="business" id={row.id} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="surface">{t("noRecords")}</p>
      );
    } else if (active === "categories" || active === "locations") {
      const table = active === "categories" ? "categories" : "locations";
      const { data, error } = await db.from(table).select("*").order("id");
      content = (
        <>
          {error ? (
            <p role="alert">{t("dataError")}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t("identifier")}</th>
                    <th>{t("name_en")}</th>
                    <th>{t("name_zh")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((row) => (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>{row.name_en}</td>
                      <td>{row.name_zh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ReferenceEditor
            kind={active === "categories" ? "category" : "location"}
          />
          {active === "categories" && <ReferenceEditor kind="subcategory" />}
        </>
      );
    } else if (active === "settings") {
      const { data, error } = await db
        .from("site_settings")
        .select("value")
        .eq("key", "posting")
        .single();
      content = error ? (
        <p role="alert">{t("dataError")}</p>
      ) : (
        <PostingSettings
          daily={Number(data?.value.daily_submissions || 10)}
          days={Number(data?.value.expiry_days || 30)}
        />
      );
    } else if (active === "promotions") {
      const { data, error } = await db
        .from("promotions")
        .select("id,kind,status,expires_at")
        .order("created_at", { ascending: false })
        .limit(50);
      content = (
        <div className="surface">
          <p className="notice">{t("promotionSoon")}</p>
          {error ? (
            <p role="alert">{t("dataError")}</p>
          ) : data?.length ? (
            <ul>
              {data.map((r) => (
                <li key={r.id}>
                  {r.kind} · {r.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t("noRecords")}</p>
          )}
        </div>
      );
    } else {
      const { data, error } = await db
        .from("audit_logs")
        .select("id,entity,operation,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      content = error ? (
        <p role="alert">{t("dataError")}</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("category")}</th>
                <th>{t("action")}</th>
                <th>{t("published")}</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((row) => (
                <tr key={row.id}>
                  <td>{row.entity}</td>
                  <td>{row.operation}</td>
                  <td>
                    {new Date(row.created_at).toLocaleString(
                      l === "zh" ? "zh-CN" : "en-US",
                      { timeZone: "America/New_York" },
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
  return (
    <div className="container page">
      <div className="account-top">
        <div>
          <p className="eyebrow">OOFCOURSE / {t("admin")}</p>
          <h1 className="page-title">{t("adminTitle")}</h1>
        </div>
        {context && <LogoutButton />}
      </div>
      <div className="dashboard">
        <nav className="dashboard-sidebar" aria-label={t("admin")}>
          {tabs.map(([s, key, Icon]) => (
            <Link
              key={s}
              href={`/admin${s === "overview" ? "" : "/" + s}`}
              aria-current={active === s ? "page" : undefined}
            >
              <Icon size={16} />
              {t(key)}
            </Link>
          ))}
        </nav>
        <section className="dashboard-content">
          <h2 style={{ marginBottom: 24 }}>
            {t(tabs.find((n) => n[0] === active)![1])}
          </h2>
          {content}
        </section>
      </div>
    </div>
  );
}
