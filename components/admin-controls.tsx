"use client";
import { useRef, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  moderateMany,
  moderateBusiness,
  restrictUser,
  resolveReport,
  updateReference,
  updateSettings,
} from "@/app/actions/admin";
import { categoryKeys } from "@/lib/catalog";
import { X } from "lucide-react";
export function ModerationControl({
  id,
  kind,
  restricted = false,
}: {
  id: string;
  kind: "listing" | "business" | "user" | "report";
  restricted?: boolean;
}) {
  const t = useTranslations(),
    router = useRouter(),
    ref = useRef<HTMLDialogElement>(null),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  return (
    <>
      <button
        className="button button-outline"
        onClick={() => ref.current?.showModal()}
      >
        {t(
          kind === "user"
            ? restricted
              ? "restore"
              : "restrict"
            : kind === "report"
              ? "resolve"
              : "adminListings",
        )}
      </button>
      <dialog ref={ref} className="dialog">
        <div className="dialog-top">
          <h2>
            {t(
              kind === "user"
                ? "adminUsers"
                : kind === "report"
                  ? "adminReports"
                  : "adminListings",
            )}
          </h2>
          <button
            className="icon-button"
            aria-label={t("navClose")}
            onClick={() => ref.current?.close()}
          >
            <X size={18} />
          </button>
        </div>
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget),
              reason = String(form.get("reason")),
              decision = String(form.get("decision"));
            start(async () => {
              const result =
                kind === "listing"
                  ? await moderateMany({ ids: [id], decision, reason })
                  : kind === "business"
                    ? await moderateBusiness({ id, decision, reason })
                    : kind === "user"
                      ? await restrictUser({
                          id,
                          restricted: !restricted,
                          reason,
                        })
                      : await resolveReport({ id, reason });
              if (result.error) setError(result.error);
              else {
                ref.current?.close();
                router.refresh();
              }
            });
          }}
        >
          <p>{t("moderateHint")}</p>
          {["listing", "business"].includes(kind) && (
            <label className="field">
              {t("status")}
              <select name="decision">
                {["approved", "rejected", "archived", "pending"].map((s) => (
                  <option value={s} key={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            {t("reason")}
            <textarea name="reason" minLength={3} maxLength={2000} required />
          </label>
          {error && (
            <p className="field-error" role="alert">
              {t(error)}
            </p>
          )}
          <button className="button primary" disabled={pending}>
            {t(pending ? "working" : "confirm")}
          </button>
        </form>
      </dialog>
    </>
  );
}
export function BulkModeration({ ids }: { ids: string[] }) {
  const t = useTranslations(),
    [selected, setSelected] = useState<string[]>([]),
    [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    router = useRouter();
  if (!ids.length) return null;
  return (
    <form
      className="surface stack"
      style={{ marginTop: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const r = await moderateMany({
            ids: selected,
            decision: String(f.get("decision")),
            reason: String(f.get("reason")),
          });
          setMessage(r.error || r.success || "serverError");
          if (!r.error) {
            setSelected([]);
            router.refresh();
          }
        });
      }}
    >
      <h3>{t("bulkReview")}</h3>
      <p className="small-note">{t("moderateHint")}</p>
      <label className="check-field">
        <input
          type="checkbox"
          checked={selected.length === ids.length}
          onChange={(e) => setSelected(e.target.checked ? ids : [])}
        />
        {t("selectVisible")}
      </label>
      <label className="field">
        {t("status")}
        <select name="decision">
          {["approved", "rejected", "archived", "pending"].map((s) => (
            <option key={s} value={s}>
              {t(s)}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        {t("reason")}
        <textarea name="reason" minLength={3} maxLength={2000} required />
      </label>
      {message && <p role="status">{t(message)}</p>}
      <button className="button primary" disabled={pending || !selected.length}>
        {t(pending ? "working" : "confirm")}
      </button>
    </form>
  );
}
export function ReferenceEditor({
  kind,
}: {
  kind: "category" | "subcategory" | "location";
}) {
  const t = useTranslations(),
    l = useLocale(),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition(),
    router = useRouter();
  const fields =
    kind === "category"
      ? ["name_en", "name_zh", "sort_order"]
      : kind === "subcategory"
        ? ["id", "name_en", "name_zh", "sort_order"]
        : [
            "id",
            "name_en",
            "name_zh",
            "state",
            "city",
            "borough",
            "neighborhood",
          ];
  return (
    <form
      className="surface stack"
      style={{ marginTop: 24 }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget),
          data: Record<string, unknown> = {};
        for (const [k, v] of f) data[k] = k === "sort_order" ? Number(v) : v;
        if (kind !== "subcategory") data.enabled = f.get("enabled") === "on";
        start(async () => {
          const r = await updateReference(kind, data);
          setMessage(r.error || r.success || "serverError");
          if (!r.error) router.refresh();
        });
      }}
    >
      <h3>{t(kind === "location" ? "adminLocations" : "adminCategories")}</h3>
      <div className="form-grid">
        {kind === "category" && (
          <label className="field">
            {t("category")}
            <select name="id">
              {categoryKeys.map((c) => (
                <option value={c} key={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === "subcategory" && (
          <label className="field">
            {t("category")}
            <select name="category_id">
              {categoryKeys.map((c) => (
                <option value={c} key={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </label>
        )}
        {fields.map((key) => (
          <label className="field" key={key}>
            {t.has(key) ? t(key) : key}
            <input
              name={key}
              type={key === "sort_order" ? "number" : "text"}
              min={key === "sort_order" ? 0 : undefined}
              maxLength={100}
              defaultValue={
                key === "sort_order"
                  ? 0
                  : key === "state"
                    ? "NY"
                    : key === "city"
                      ? "New York"
                      : ""
              }
              required={!["borough", "neighborhood"].includes(key)}
            />
          </label>
        ))}
      </div>
      {kind !== "subcategory" && (
        <label className="check-field">
          <input type="checkbox" name="enabled" defaultChecked />
          {t("enabled")}
        </label>
      )}
      {message && <p role="status">{t(message)}</p>}
      <button className="button primary" disabled={pending}>
        {t(pending ? "working" : "saveChanges")}
      </button>
      <p className="small-note">
        {l === "zh"
          ? "使用现有标识可更新记录，新标识会创建记录。"
          : "An existing identifier updates its record; a new identifier creates one."}
      </p>
    </form>
  );
}
export function PostingSettings({
  daily,
  days,
}: {
  daily: number;
  days: number;
}) {
  const t = useTranslations(),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  return (
    <form
      className="surface stack"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        start(async () => {
          const r = await updateSettings({
            daily: Number(f.get("daily")),
            days: Number(f.get("days")),
          });
          setMessage(r.error || r.success || "serverError");
        });
      }}
    >
      <label className="field">
        {t("dailyLimit")}
        <input
          name="daily"
          type="number"
          min={1}
          max={20}
          defaultValue={daily}
          required
        />
      </label>
      <label className="field">
        {t("expiryDays")}
        <input
          name="days"
          type="number"
          min={1}
          max={90}
          defaultValue={days}
          required
        />
      </label>
      <p className="small-note">{t("moderateHint")}</p>
      {message && <p role="status">{t(message)}</p>}
      <button className="button primary" disabled={pending}>
        {t(pending ? "working" : "saveChanges")}
      </button>
    </form>
  );
}
