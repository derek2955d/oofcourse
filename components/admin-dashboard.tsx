"use client";
import { useEffect, useRef, useState } from "react";
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
  { key: "categories", name: "Categories", icon: Tags },
  { key: "retailers", name: "Retailers", icon: Store },
  { key: "affiliate_links", name: "Affiliate links", icon: Link2 },
  { key: "deal_sources", name: "Sources", icon: Database },
];
const fields: Record<AdminTab, string[]> = {
  products: [
    "name",
    "slug",
    "description",
    "category_id",
    "retailer_id",
    "source_id",
    "merchant",
    "image_url",
    "image_license",
    "status",
    "last_checked_at",
    "expires_at",
    "is_demo",
  ],
  categories: ["name", "slug", "description"],
  retailers: [
    "name",
    "slug",
    "homepage_url",
    "allowed_hosts",
    "enabled",
    "affiliate_approved",
  ],
  affiliate_links: [
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
const booleans = ["is_demo", "enabled", "approved", "affiliate_approved"];
export function AdminDashboard({
  live = false,
  initialRecords,
}: {
  live?: boolean;
  initialRecords?: AdminRecords;
}) {
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
                Array.isArray(parsed[t.key]) &&
                parsed[t.key].every(
                  (r: unknown) =>
                    r &&
                    typeof r === "object" &&
                    typeof (r as DemoRecord).id === "string",
                ),
            )
          )
            setRecords(parsed);
        }
      } catch {
        setMessage(
          "Local demo storage is unavailable. Changes will last only for this visit.",
        );
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [live]);
  function persist(next: AdminRecords) {
    setRecords(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      setMessage(
        "Browser storage could not be updated. Changes are temporary.",
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
      data[f] = booleans.includes(f)
        ? v === "on"
        : f.endsWith("_at")
          ? v
            ? new Date(String(v)).toISOString()
            : null
          : String(v || "");
    }
    if (!live && tab === "products") data.is_demo = true;
    if (tab === "products" && !data.source_id) data.source_id = null;
    if (live && tab === "retailers")
      data.allowed_hosts = String(data.allowed_hosts)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (edit?.id) data.id = edit.id;
    if (live) {
      const result = await saveAdminRecord(tab, data);
      if (result.error) {
        setMessage(result.error);
        setPending(false);
        return;
      }
      router.refresh();
      setMessage(
        "Saved to the configured database. The public site still uses its demo adapter.",
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
        "Local demo saved. No public data or remote database was changed.",
      );
    }
    setPending(false);
    dialog.current?.close();
    setEdit(null);
  }
  async function archive(r: DemoRecord) {
    if (live) {
      const result = await archiveAdminProduct(r.id);
      setMessage(result.error || "Product archived.");
      router.refresh();
    } else {
      persist({
        ...records,
        products: records.products.map((p) =>
          p.id === r.id ? { ...p, status: "archived" } : p,
        ),
      });
      setMessage("Archived in local demo only.");
    }
  }
  return (
    <div className="admin-workspace">
      <aside className="admin-sidebar">
        <span className="admin-title">
          <LayoutDashboard size={18} />
          Workspace
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
            {t.name}
            <span>{records[t.key].length}</span>
          </button>
        ))}
        <div className="admin-sidebar-note">
          <ShieldCheck size={21} />
          <strong>{live ? "Authenticated admin" : "Local demo mode"}</strong>
          <p>
            {live
              ? "Server authorization and database RLS protect every write."
              : "No sign-in or database connection. Local edits never publish to the site."}
          </p>
        </div>
      </aside>
      <div className="admin-content">
        <div className="admin-content-top">
          <div>
            <p className="eyebrow">
              {live ? "CONNECTED WORKSPACE" : "BROWSER-ONLY DEMO"}
            </p>
            <h2>{tabs.find((t) => t.key === tab)?.name}</h2>
          </div>
          <button
            className="button primary"
            onClick={() => open()}
            disabled={!ready}
          >
            <Plus size={16} />
            Create {tab === "products" ? "product" : "record"}
          </button>
        </div>
        <div className="admin-metrics">
          <div>
            <span>Products</span>
            <strong>{records.products.length}</strong>
          </div>
          <div>
            <span>Pending review</span>
            <strong>
              {
                records.products.filter((p) => p.status === "pending_review")
                  .length
              }
            </strong>
          </div>
          <div>
            <span>Outbound clicks</span>
            <strong className="metric-text">Not collecting</strong>
          </div>
        </div>
        <p className="admin-warning">
          {live
            ? "Supabase is connected. The public catalog still uses original demo data; enabling live ingestion requires a separate content and compliance review."
            : "Try creating, editing, reviewing, and archiving records. Everything stays in this browser. Never enter real credentials or personal data here."}
        </p>
        {message && (
          <p className="admin-message" role="status">
            {message}
          </p>
        )}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="sr-only">{tab} records</caption>
            <thead>
              <tr>
                <th>Name / record</th>
                <th>{tab === "products" ? "Retailer" : "Identifier"}</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records[tab].map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>
                      {String(r.name || r.url || r.product_id || "Record")}
                    </strong>
                    <small>{String(r.slug || r.id)}</small>
                  </td>
                  <td>{String(r.retailer_id || r.slug || "—")}</td>
                  <td>
                    <span className="admin-status">
                      {String(
                        r.status || (r.enabled ? "Enabled" : "Not enabled"),
                      )}
                      {!live ? " · Demo" : ""}
                    </span>
                    {tab === "products" && (
                      <small>
                        {r.last_checked_at
                          ? `${live ? "Checked" : "Demo check"}: ${String(r.last_checked_at).slice(0, 10)}`
                          : "Not verified"}
                      </small>
                    )}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        aria-label={`Edit ${r.name || "record"}`}
                        onClick={() => open(r)}
                      >
                        <Pencil size={15} />
                      </button>
                      {tab === "products" && (
                        <button
                          aria-label={`Archive ${r.name}`}
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
              <h3>No records yet.</h3>
              <p>
                No placeholder buying links are enabled. Create a local demo
                record to try the workflow.
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
                setMessage("Local workspace reset to original demo data.");
              }}
            >
              <RotateCcw size={15} />
              Reset demo workspace
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
              Sign out
            </button>
          )}
          <span>Clicks are not orders or commissions.</span>
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
            {edit?.id ? "Edit record" : "Create record"}
          </h2>
          <button
            aria-label="Close editor"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>
        <p>
          {live
            ? "Changes require server authorization."
            : "Local demo only. Nothing is published."}
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
                  className={f === "description" ? "editor-wide" : ""}
                >
                  {f.replaceAll("_", " ")}
                  {booleans.includes(f) ? (
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
                          {s.replaceAll("_", " ")}
                          {!live ? " (demo only)" : ""}
                        </option>
                      ))}
                    </select>
                  ) : f === "source_type" ? (
                    <select name={f} defaultValue={String(edit[f] || "manual")}>
                      <option value="manual">Manual</option>
                      <option value="official_api">Official API</option>
                      <option value="approved_feed">Approved feed</option>
                    </select>
                  ) : f === "description" ? (
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
                      type={f.endsWith("_at") ? "datetime-local" : "text"}
                      defaultValue={String(edit[f] || "").slice(
                        0,
                        f.endsWith("_at") ? 16 : 8000,
                      )}
                      required={!f.endsWith("_at") && f !== "source_id"}
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
                Cancel
              </button>
              <button className="button primary" disabled={pending}>
                {pending
                  ? "Saving…"
                  : live
                    ? "Save authorized changes"
                    : "Save local demo"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}
