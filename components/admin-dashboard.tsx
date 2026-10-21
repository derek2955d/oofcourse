"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "./locale-provider";
import { tr, fieldLabel } from "@/lib/i18n/admin";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Archive,
  X,
  ShieldCheck,
  RotateCcw,
  LayoutDashboard,
  Package,
  Tags,
  Store,
  Link2,
  Database,
  LogOut,
} from "lucide-react";
import {
  demoAdminRecords,
  type AdminTab,
  type DemoRecord,
  type AdminRecords,
} from "@/lib/admin-demo";
import { productStatuses } from "@/lib/data";
import {
  saveAdminRecord,
  archiveAdminProduct,
  logoutAdmin,
} from "@/app/admin/actions";
const storageKey = "oofcourse:admin-demo:v2";
const tabs: { key: AdminTab; name: string; icon: typeof Package }[] = [
  { key: "products", name: "Products", icon: Package },
  { key: "offers", name: "Offers", icon: Tags },
  { key: "categories", name: "Categories", icon: Tags },
  { key: "retailers", name: "Retailers", icon: Store },
  { key: "affiliate_links", name: "Affiliate links", icon: Link2 },
  { key: "deal_sources", name: "Sources", icon: Database },
];
const fields: Record<AdminTab, string[]> = {
  products: [
    "name",
    "name_zh",
    "slug",
    "description",
    "description_zh",
    "category_id",
    "retailer_id",
    "source_id",
    "merchant",
    "image_url",
    "image_license",
    "content_scope",
    "content_retailer_id",
    "status",
    "last_checked_at",
    "expires_at",
    "is_demo",
  ],
  categories: ["name", "name_zh", "slug", "description"],
  retailers: [
    "name",
    "slug",
    "homepage_url",
    "allowed_hosts",
    "enabled",
    "affiliate_approved",
  ],
  offers: [
    "product_id",
    "retailer_id",
    "source_id",
    "status",
    "is_demo",
    "currency",
    "current_price",
    "original_price",
    "price_verified",
    "price_usage_authorized",
    "image_url",
    "image_license",
    "content_scope",
    "content_retailer_id",
    "last_checked_at",
    "expires_at",
  ],
  affiliate_links: [
    "offer_id",
    "product_id",
    "retailer_id",
    "source_id",
    "url",
    "approved",
    "enabled",
    "checked_at",
    "expires_at",
  ],
  deal_sources: [
    "name",
    "merchant",
    "retailer_id",
    "source_type",
    "homepage_url",
    "enabled",
    "affiliate_approved",
  ],
};
const booleans = [
  "is_demo",
  "enabled",
  "approved",
  "affiliate_approved",
  "price_verified",
  "price_usage_authorized",
];
export function AdminDashboard({
  live = false,
  initialRecords,
}: {
  live?: boolean;
  initialRecords?: AdminRecords;
}) {
  const locale = useLocale();
  const [records, setRecords] = useState<AdminRecords>(
      initialRecords || demoAdminRecords,
    ),
    [tab, setTab] = useState<AdminTab>("products"),
    [edit, setEdit] = useState<DemoRecord | null>(null),
    [message, setMessage] = useState(""),
    [ready, setReady] = useState(live),
    [pending, setPending] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    if (live) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            tabs.every(
              (t) =>
                (Array.isArray(parsed[t.key]) || !(t.key in parsed)) &&
                (parsed[t.key] || []).every(
                  (r: unknown) =>
                    r &&
                    typeof r === "object" &&
                    typeof (r as DemoRecord).id === "string",
                ),
            )
          )
            setRecords({ ...demoAdminRecords, ...parsed });
        }
      } catch {
        setMessage(
          tr(
            locale,
            "Local demo storage is unavailable. Changes will last only for this visit.",
          ),
        );
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [live, locale]);
  function persist(next: AdminRecords) {
    setRecords(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setMessage(
        tr(
          locale,
          "Browser storage could not be updated. Changes are temporary.",
        ),
      );
    }
  }
  function open(record?: DemoRecord) {
    const next = record || {
      id: "",
      ...Object.fromEntries(
        fields[tab].map((f) => [
          f,
          booleans.includes(f)
            ? f === "is_demo"
            : f === "status"
              ? "draft"
              : f === "source_type"
                ? "manual"
                : f === "currency"
                  ? "USD"
                  : f === "content_scope"
                    ? "retailer_restricted"
                    : "",
        ]),
      ),
    };
    setEdit(next);
    setMessage("");
    dialog.current?.showModal();
  }
  async function submit(form: FormData) {
    setPending(true);
    const data: Record<string, unknown> = {};
    for (const f of fields[tab]) {
      const v = form.get(f);
      data[f] = ["current_price", "original_price"].includes(f)
        ? v
          ? Number(v)
          : null
        : booleans.includes(f)
          ? v === "on"
          : f.endsWith("_at")
            ? v
              ? new Date(String(v)).toISOString()
              : null
            : String(v || "");
    }
    if (!live && (tab === "products" || tab === "offers")) data.is_demo = true;
    if (tab === "products" && !data.source_id) data.source_id = null;
    if (tab === "products" && !data.retailer_id) data.retailer_id = null;
    if ((tab === "offers" || tab === "products") && !data.content_retailer_id)
      data.content_retailer_id = null;
    if (live && tab === "retailers")
      data.allowed_hosts = String(data.allowed_hosts)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (edit?.id) data.id = edit.id;
    if (live) {
      const result = await saveAdminRecord(tab, data);
      if (result.error) {
        setMessage(tr(locale, result.error));
        setPending(false);
        return;
      }
      router.refresh();
      setMessage(
        tr(
          locale,
          "Saved to the configured database. The public site still uses its demo adapter.",
        ),
      );
    } else {
      const id = edit?.id || `local-${crypto.randomUUID()}`;
      const item = { ...data, id } as DemoRecord;
      persist({
        ...records,
        [tab]: records[tab].some((r) => r.id === id)
          ? records[tab].map((r) => (r.id === id ? item : r))
          : [item, ...records[tab]],
      });
      setMessage(
        tr(
          locale,
          "Local demo saved. No public data or remote database was changed.",
        ),
      );
    }
    setPending(false);
    dialog.current?.close();
    setEdit(null);
  }
  async function archive(r: DemoRecord) {
    if (live) {
      const result = await archiveAdminProduct(r.id);
      setMessage(
        result.error
          ? tr(locale, result.error)
          : tr(locale, "Product archived."),
      );
      router.refresh();
    } else {
      persist({
        ...records,
        products: records.products.map((p) =>
          p.id === r.id ? { ...p, status: "archived" } : p,
        ),
      });
      setMessage(tr(locale, "Archived in local demo only."));
    }
  }
  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <span className="admin-title">
          <LayoutDashboard size={18} />
          {tr(locale, "Workspace")}{" "}
        </span>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            aria-pressed={tab === t.key}
            onClick={() => {
              setTab(t.key);
              setMessage("");
            }}
          >
            <t.icon size={17} />
            {tr(locale, t.name)}
            <span>{records[t.key].length}</span>
          </button>
        ))}
        <div className="admin-sidebar-note">
          <ShieldCheck size={21} />
          <strong>
            {live
              ? tr(locale, "Authenticated admin")
              : tr(locale, "Local demo mode")}
          </strong>
          <p>
            {live
              ? tr(
                  locale,
                  "Server authorization and database RLS protect every write.",
                )
              : tr(
                  locale,
                  "No sign-in or database connection. Local edits never publish to the site.",
                )}
          </p>
        </div>
      </aside>
      <div className="admin-content">
        <div className="admin-content-top">
          <div>
            <p className="eyebrow">
              {live
                ? tr(locale, "CONNECTED WORKSPACE")
                : tr(locale, "BROWSER-ONLY DEMO")}
            </p>
            <h2>{tr(locale, tabs.find((t) => t.key === tab)?.name || "")}</h2>
          </div>
          <button
            className="button primary"
            onClick={() => open()}
            disabled={!ready}
          >
            <Plus size={16} />
            {tr(locale, "Create")}{" "}
            {tab === "products" ? tr(locale, "product") : tr(locale, "record")}
          </button>
        </div>
        <div className="admin-metrics">
          <div>
            <span>{tr(locale, "Products")} </span>
            <strong>{records.products.length}</strong>
          </div>
          <div>
            <span>{tr(locale, "Pending review")} </span>
            <strong>
              {
                records.products.filter((p) => p.status === "pending_review")
                  .length
              }
            </strong>
          </div>
          <div>
            <span>{tr(locale, "Outbound clicks")} </span>
            <strong className="metric-text">
              {tr(locale, "Not collecting")}{" "}
            </strong>
          </div>
        </div>
        <p className="admin-warning">
          {live
            ? tr(
                locale,
                "Supabase is connected. The public catalog still uses original demo data; enabling live ingestion requires a separate content and compliance review.",
              )
            : tr(
                locale,
                "Try creating, editing, reviewing, and archiving records. Everything stays in this browser. Never enter real credentials or personal data here.",
              )}
        </p>
        {message && (
          <p className="admin-message" role={"status"}>
            {message}
          </p>
        )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="sr-only">
              {tab}
              {tr(locale, "records")}{" "}
            </caption>
            <thead>
              <tr>
                <th>{tr(locale, "Name / record")} </th>
                <th>
                  {tab === "products"
                    ? tr(locale, "Retailer")
                    : tr(locale, "Identifier")}
                </th>
                <th>{tr(locale, "Status")} </th>
                <th>{tr(locale, "Actions")} </th>
              </tr>
            </thead>
            <tbody>
              {records[tab].map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {String(
                        (locale === "zh" && r.name_zh ? r.name_zh : r.name) ||
                          r.url ||
                          r.product_id ||
                          tr(locale, "Record"),
                      )}
                    </strong>
                    <small>{String(r.slug || r.id)}</small>
                  </td>
                  <td>{String(r.retailer_id || r.slug || "—")}</td>
                  <td>
                    <span className="admin-status">
                      {String(
                        r.status
                          ? tr(locale, String(r.status).replaceAll("_", " "))
                          : r.enabled
                            ? tr(locale, "Enabled")
                            : tr(locale, "Not enabled"),
                      )}
                      {!live ? tr(locale, " · Demo") : ""}
                    </span>
                    {tab === "products" && (
                      <small>
                        {r.last_checked_at
                          ? `${live ? tr(locale, "Checked") : tr(locale, "Demo check")}: ${String(r.last_checked_at).slice(0, 10)}`
                          : tr(locale, "Not verified")}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        aria-label={`${tr(locale, "Edit")} ${r.name || tr(locale, "record")}`}
                        onClick={() => open(r)}
                      >
                        <Pencil size={15} />
                      </button>
                      {tab === "products" && (
                        <button
                          aria-label={`${tr(locale, "Archive")} ${r.name}`}
                          onClick={() => archive(r)}
                        >
                          <Archive size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records[tab].length === 0 && (
            <div className="admin-empty">
              <Link2 size={25} />
              <h3>{tr(locale, "No records yet.")} </h3>
              <p>
                {tr(
                  locale,
                  "No placeholder buying links are enabled. Create a local demo record to try the workflow.",
                )}{" "}
              </p>
            </div>
          )}
        </div>
        <div className="admin-bottom">
          {!live ? (
            <button
              className="text-link"
              onClick={() => {
                persist(structuredClone(demoAdminRecords));
                setMessage(
                  tr(locale, "Local workspace reset to original demo data."),
                );
              }}
            >
              <RotateCcw size={15} />
              {tr(locale, "Reset demo workspace")}{" "}
            </button>
          ) : (
            <button
              className="text-link"
              onClick={async () => {
                await logoutAdmin();
                router.refresh();
              }}
            >
              <LogOut size={15} />
              {tr(locale, "Sign out")}{" "}
            </button>
          )}
          <span>{tr(locale, "Clicks are not orders or commissions.")} </span>
        </div>
      </div>
      <dialog
        ref={dialog}
        aria-labelledby="editor-title"
        className="admin-dialog"
        onClose={() => setEdit(null)}
      >
        <div className="dialog-heading">
          <h2 id="editor-title">
            {edit?.id ? tr(locale, "Edit record") : tr(locale, "Create record")}
          </h2>
          <button
            aria-label={tr(locale, "Close editor")}
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          {live
            ? tr(locale, "Changes require server authorization.")
            : tr(locale, "Local demo only. Nothing is published.")}
        </p>
        {edit && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(new FormData(e.currentTarget));
            }}
          >
            <div className="editor-fields">
              {fields[tab].map((f) => (
                <label
                  key={f}
                  className={
                    f === "description" || f === "description_zh"
                      ? "editor-wide"
                      : ""
                  }
                >
                  {fieldLabel(locale, f)}
                  {[
                    "category_id",
                    "retailer_id",
                    "source_id",
                    "product_id",
                    "offer_id",
                    "content_retailer_id",
                  ].includes(f) ? (
                    <select
                      name={f}
                      aria-label={fieldLabel(locale, f)}
                      defaultValue={String(edit[f] || "")}
                      required={
                        !(
                          (tab === "products" &&
                            (f === "source_id" || f === "retailer_id")) ||
                          f === "content_retailer_id"
                        )
                      }
                    >
                      <option value="">
                        {locale === "zh" ? "请选择" : "Select a record"}
                      </option>
                      {records[
                        (
                          {
                            category_id: "categories",
                            retailer_id: "retailers",
                            content_retailer_id: "retailers",
                            source_id: "deal_sources",
                            product_id: "products",
                            offer_id: "offers",
                          } as Record<string, AdminTab>
                        )[f]
                      ].map((r) => (
                        <option key={r.id} value={r.id}>
                          {String(
                            locale === "zh" && r.name_zh
                              ? r.name_zh
                              : r.name ||
                                  `${r.product_id || r.id} · ${r.retailer_id || ""}`,
                          )}
                        </option>
                      ))}
                    </select>
                  ) : booleans.includes(f) ? (
                    <input
                      type="checkbox"
                      name={f}
                      defaultChecked={Boolean(edit[f])}
                      disabled={f === "is_demo" && !live}
                    />
                  ) : f === "status" ? (
                    <select name={f} defaultValue={String(edit[f] || "draft")}>
                      {productStatuses.map((s) => (
                        <option key={s} value={s}>
                          {tr(locale, s.replaceAll("_", " "))}
                          {!live ? tr(locale, " (demo only)") : ""}
                        </option>
                      ))}
                    </select>
                  ) : f === "content_scope" ? (
                    <select
                      name={f}
                      defaultValue={String(edit[f] || "retailer_restricted")}
                    >
                      <option value="retailer_restricted">
                        {tr(locale, "retailer restricted")}
                      </option>
                      <option value="neutral">{tr(locale, "neutral")}</option>
                    </select>
                  ) : f === "source_type" ? (
                    <select name={f} defaultValue={String(edit[f] || "manual")}>
                      <option value="manual">{tr(locale, "Manual")} </option>
                      <option value="official_api">
                        {tr(locale, "Official API")}{" "}
                      </option>
                      <option value="approved_feed">
                        {tr(locale, "Approved feed")}{" "}
                      </option>
                    </select>
                  ) : f === "description" || f === "description_zh" ? (
                    <textarea
                      name={f}
                      defaultValue={String(edit[f] || "")}
                      rows={3}
                      required
                      maxLength={8000}
                    />
                  ) : (
                    <input
                      name={f}
                      type={
                        ["current_price", "original_price"].includes(f)
                          ? "number"
                          : f.endsWith("_at")
                            ? "datetime-local"
                            : "text"
                      }
                      min={
                        ["current_price", "original_price"].includes(f)
                          ? 0
                          : undefined
                      }
                      step={
                        ["current_price", "original_price"].includes(f)
                          ? "0.01"
                          : undefined
                      }
                      defaultValue={String(edit[f] || "").slice(
                        0,
                        f.endsWith("_at") ? 16 : 8000,
                      )}
                      required={
                        !f.endsWith("_at") &&
                        f !== "source_id" &&
                        f !== "name_zh" &&
                        f !== "description_zh" &&
                        ![
                          "current_price",
                          "original_price",
                          "content_retailer_id",
                        ].includes(f)
                      }
                      maxLength={f === "url" ? 2048 : 1000}
                    />
                  )}
                </label>
              ))}
            </div>
            {message && (
              <p role="alert" className="admin-message">
                {message}
              </p>
            )}
            <div className="dialog-buttons">
              <button
                className="button secondary"
                type="button"
                onClick={() => dialog.current?.close()}
              >
                {tr(locale, "Cancel")}{" "}
              </button>
              <button className="button primary" disabled={pending}>
                {pending
                  ? tr(locale, "Saving…")
                  : live
                    ? tr(locale, "Save authorized changes")
                    : tr(locale, "Save local demo")}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
