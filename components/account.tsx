import {
  ownerListingQuery,
  ownerListingHref,
  ownerListingStatuses,
  ownerListingDisplayStatus,
  ownerPageSize,
} from "@/lib/account-listings";
import { hasRecentRecoveryAuthentication } from "@/lib/password-security";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { configured, requireUser } from "@/lib/supabase/server";
import { fromRow, attachImages } from "@/lib/listings";
import { ListingGrid } from "./cards";
import { ConnectionNotice, StatusBadge } from "./ui";
import {
  AccountForm,
  ConfirmationDialog,
  LogoutButton,
  ReplyForm,
  BusinessLogoUploader,
} from "./account-controls";
import {
  Plus,
  LayoutDashboard,
  Files,
  Heart,
  MessageCircle,
  UserRound,
  Shield,
  Store,
} from "lucide-react";
export async function AccountDashboard({
  section = "overview",
  raw = {},
}: {
  section?: string;
  raw?: Record<string, string | string[] | undefined>;
}) {
  const t = await getTranslations(),
    l = await getLocale();
  if (!configured())
    return (
      <div className="container page">
        <h1 className="page-title">{t("accountTitle")}</h1>
        <ConnectionNotice />
        <Link href="/login" className="button primary">
          {t("login")}
        </Link>
      </div>
    );
  let context;
  try {
    context = await requireUser();
  } catch {
    return (
      <div className="container page centered">
        <h1>{t("authRequired")}</h1>
        <Link
          href={`/login?next=${encodeURIComponent(`/account/${section === "overview" ? "" : section}`)}`}
          className="button primary"
        >
          {t("login")}
        </Link>
      </div>
    );
  }
  const { db, user } = context;
  const nav = [
    ["overview", "accountOverview", LayoutDashboard],
    ["listings", "myListings", Files],
    ["drafts", "myDrafts", Files],
    ["pending", "pendingReview", Files],
    ["saved", "navSaved", Heart],
    ["messages", "messages", MessageCircle],
    ["profile", "profile", UserRound],
    ["business", "business", Store],
    ["security", "security", Shield],
  ] as const;
  const active = nav.find((x) => x[0] === section)?.[0] || "overview";
  let content: React.ReactNode;
  if (["listings", "drafts", "pending"].includes(active)) {
    const filter = ownerListingQuery(active, raw);
    const now = new Date().toISOString();
    let q = db
      .from("listings")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);
    if (filter.status === "expired") {
      q = q.or(
        `status.eq.expired,and(status.eq.approved,expires_at.lte.${now})`,
      );
    } else if (filter.status) {
      q = q.eq("status", filter.status);
      if (filter.status === "approved") q = q.gt("expires_at", now);
    }
    const { data, error, count } = await q
      .order("updated_at", { ascending: false })
      .order("id")
      .range(filter.from, filter.to);
    const pages = Math.max(1, Math.ceil((count || 0) / ownerPageSize));
    const formatDate = (value: string | null) =>
      value && Number.isFinite(Date.parse(value))
        ? new Date(value).toLocaleDateString(l === "zh" ? "zh-CN" : "en-US", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—";
    content = (
      <>
        {active === "listings" && (
          <nav
            className="owner-status-filters"
            aria-label={t("ownerListings.statusFilters")}
          >
            {["", ...ownerListingStatuses].map((status) => (
              <Link
                key={status}
                href={ownerListingHref(active, status)}
                aria-current={filter.status === status ? "page" : undefined}
              >
                {status ? t(status) : t("ownerListings.all")}
              </Link>
            ))}
          </nav>
        )}
        <p className="owner-listing-summary" role="status">
          {error ? t("dataError") : t("results", { count: count || 0 })}
        </p>
        {error ? (
          <p className="notice error-notice" role="alert">
            {t("dataError")}
          </p>
        ) : data?.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("title")}</th>
                  <th>{t("status")}</th>
                  <th>{t("category")}</th>
                  <th>{t("ownerListings.dates")}</th>
                  <th>{t("edit")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title || t("draft")}</td>
                    <td>
                      <StatusBadge
                        status={ownerListingDisplayStatus(
                          row.status,
                          row.expires_at,
                        )}
                        label={t(
                          ownerListingDisplayStatus(row.status, row.expires_at),
                        )}
                      />
                    </td>
                    <td>{t(row.category_id)}</td>
                    <td>
                      <span className="owner-record-date">
                        {t("ownerListings.updated")}{" "}
                        <time dateTime={row.updated_at}>
                          {formatDate(row.updated_at)}
                        </time>
                      </span>
                      {row.expires_at && (
                        <span className="owner-record-date">
                          {t("ownerListings.expires")}{" "}
                          <time dateTime={row.expires_at}>
                            {formatDate(row.expires_at)}
                          </time>
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          className="button button-outline"
                          href={`/post?id=${row.id}`}
                        >
                          {t("edit")}
                        </Link>
                        {row.status !== "archived" && (
                          <ConfirmationDialog id={row.id} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="surface centered">
            <h2>
              {t(
                filter.page > pages
                  ? "ownerListings.missingPage"
                  : filter.status
                    ? "ownerListings.emptyStatus"
                    : "noListings",
              )}
            </h2>
            {(filter.status || filter.page > 1) && (
              <Link href={ownerListingHref("listings")} className="text-link">
                {t("ownerListings.backAll")}
              </Link>
            )}
            <Link href="/post" className="button primary">
              {t("navPost")}
            </Link>
          </div>
        )}
        {!error && pages > 1 && filter.page <= pages && (
          <nav
            className="pagination"
            aria-label={t("page", { page: filter.page, pages })}
          >
            {filter.page > 1 && (
              <Link
                className="button button-outline"
                href={ownerListingHref(
                  active,
                  filter.status,
                  Math.min(pages, filter.page - 1),
                )}
              >
                {t("previous")}
              </Link>
            )}
            <span>{t("page", { page: filter.page, pages })}</span>
            {filter.page < pages && (
              <Link
                className="button button-outline"
                href={ownerListingHref(active, filter.status, filter.page + 1)}
              >
                {t("next")}
              </Link>
            )}
          </nav>
        )}
      </>
    );
  } else if (active === "saved") {
    const { data, error } = await db
      .from("favorites")
      .select("listing_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) content = <p role="alert">{t("dataError")}</p>;
    else {
      const ids = data?.map((r) => r.listing_id) || [];
      const { data: rows, error: readError } = ids.length
        ? await db
            .from("listings")
            .select("*")
            .in("id", ids)
            .eq("status", "approved")
            .gt("expires_at", new Date().toISOString())
        : { data: [], error: null };
      const items = (rows || []).map(fromRow).filter((p) => p !== null);
      if (items.length) await attachImages(items, db);
      content = readError ? (
        <p role="alert">{t("dataError")}</p>
      ) : items.length ? (
        <ListingGrid items={items} />
      ) : (
        <div className="surface centered">
          <Heart size={34} />
          <h2>{t("noSaved")}</h2>
          <p>{t("noSavedText")}</p>
          <Link href="/categories" className="button primary">
            {t("navCategories")}
          </Link>
        </div>
      );
    }
  } else if (active === "profile") {
    const { data, error } = await db
      .from("profiles")
      .select("display_name,bio")
      .eq("id", user.id)
      .single();
    content = error ? (
      <p role="alert">{t("dataError")}</p>
    ) : (
      <div className="surface">
        <AccountForm kind="profile" initial={data || {}} />
      </div>
    );
  } else if (active === "security") {
    let recoveryVerified = false;
    try {
      const claims = await db.auth.getClaims();
      recoveryVerified =
        !claims.error &&
        hasRecentRecoveryAuthentication(claims.data?.claims, user.id);
    } catch {
      /* Requiring current-password verification is the safe fallback. */
    }
    content = (
      <div className="surface">
        <AccountForm kind="security" recoveryVerified={recoveryVerified} />
        <div style={{ marginTop: 24 }}>
          <LogoutButton />
        </div>
      </div>
    );
  } else if (active === "business") {
    const { data, error } = await db
      .from("business_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    content = error ? (
      <p role="alert">{t("dataError")}</p>
    ) : (
      <div className="surface">
        <h2 style={{ marginBottom: 20 }}>{t("businessTitle")}</h2>
        {data && (
          <p style={{ marginBottom: 20 }}>
            <StatusBadge status={data.status} label={t(data.status)} />
          </p>
        )}
        <AccountForm kind="business" initial={data || {}} />
        {data && <BusinessLogoUploader />}
        {data?.status === "approved" && (
          <Link href={`/businesses/profiles/${data.id}`} className="text-link">
            {t("viewBusiness")}
          </Link>
        )}
        <p className="notice">{t("promotionSoon")}</p>
      </div>
    );
  } else if (active === "messages") {
    const { data: conversations, error } = await db
      .from("conversations")
      .select("id,listing_id,created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    const { data: messages, error: messageError } = conversations?.length
      ? await db
          .from("messages")
          .select("id,conversation_id,sender_id,body,created_at")
          .in(
            "conversation_id",
            conversations.map((c) => c.id),
          )
          .order("created_at")
          .limit(500)
      : { data: [], error: null };
    content =
      error || messageError ? (
        <p role="alert">{t("dataError")}</p>
      ) : conversations?.length ? (
        <div className="record-list">
          {conversations.map((c, i) => (
            <section className="record" key={c.id}>
              <h2>
                {t("messages")} {i + 1}
              </h2>
              {messages
                ?.filter((m) => m.conversation_id === c.id)
                .map((m) => (
                  <div
                    key={m.id}
                    className="notice"
                    style={{
                      background:
                        m.sender_id === user.id ? "#EAF2FF" : "#F7F9FD",
                    }}
                  >
                    <p>{m.body}</p>
                    <small>
                      {new Date(m.created_at).toLocaleString(
                        l === "zh" ? "zh-CN" : "en-US",
                        { timeZone: "America/New_York" },
                      )}
                    </small>
                  </div>
                ))}
              <ReplyForm conversation={c.id} />
            </section>
          ))}
        </div>
      ) : (
        <div className="surface centered">
          <MessageCircle size={34} />
          <h2>{t("noMessages")}</h2>
        </div>
      );
  } else {
    const counts = await Promise.all(
      ["draft", "pending", "approved"].map((status) => {
        let query = db
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", status);
        if (status === "approved")
          query = query.gt("expires_at", new Date().toISOString());
        return query;
      }),
    );
    const { data: notes } = await db
      .from("notifications")
      .select("id,kind,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    content = counts.some((r) => r.error) ? (
      <p role="alert">{t("dataError")}</p>
    ) : (
      <>
        <div className="metric-grid">
          {["draft", "pending", "approved"].map((s, i) => (
            <Link
              className="metric owner-metric"
              key={s}
              href={ownerListingHref("listings", s)}
            >
              <span>{t(s)}</span>
              <strong>{counts[i].count || 0}</strong>
            </Link>
          ))}
        </div>
        <div className="surface">
          <h2>{t("accountOverview")}</h2>
          <p className="page-intro" style={{ marginTop: 12 }}>
            {t("submissionHint")}
          </p>
          <Link href="/post" className="button primary">
            <Plus size={17} />
            {t("navPost")}
          </Link>
        </div>
        {!!notes?.length && (
          <div className="record-list" style={{ marginTop: 24 }}>
            {notes.map((n) => (
              <div key={n.id} className="record">
                <p>
                  {t(
                    ["approved", "rejected", "pending", "archived"].includes(
                      n.kind,
                    )
                      ? n.kind
                      : "messages",
                  )}
                </p>
                <small>
                  {new Date(n.created_at).toLocaleDateString(
                    l === "zh" ? "zh-CN" : "en-US",
                    { timeZone: "America/New_York" },
                  )}
                </small>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }
  return (
    <div className="container page">
      <div className="account-top">
        <div>
          <p className="eyebrow">OOFCOURSE / {t("navAccount")}</p>
          <h1 className="page-title">{t("accountTitle")}</h1>
        </div>
        <Link href="/post" className="button primary">
          <Plus size={17} />
          {t("navPost")}
        </Link>
      </div>
      <div className="dashboard">
        <nav className="dashboard-sidebar" aria-label={t("navAccount")}>
          {nav.map(([s, key, Icon]) => (
            <Link
              href={`/account${s === "overview" ? "" : "/" + s}`}
              key={s}
              aria-current={active === s ? "page" : undefined}
            >
              <Icon size={16} />
              {t(key)}
            </Link>
          ))}
        </nav>
        <section className="dashboard-content">
          <h2 style={{ marginBottom: 24 }}>
            {t(nav.find((n) => n[0] === active)![1])}
          </h2>
          {content}
        </section>
      </div>
    </div>
  );
}
