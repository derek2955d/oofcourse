"use client";
import { useCatalogConfig } from "./catalog-provider";
import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { archiveListing } from "@/app/actions/publishing";
import {
  updateProfile,
  saveBusiness,
  replyMessage,
} from "@/app/actions/account";
import { changePassword, logout } from "@/app/actions/auth";
import { type Locale } from "@/lib/catalog";
export function ConfirmationDialog({ id }: { id: string }) {
  const t = useTranslations(),
    ref = useRef<HTMLDialogElement>(null),
    [pending, start] = useTransition(),
    [error, setError] = useState(""),
    router = useRouter();
  return (
    <>
      <button
        className="button button-outline"
        onClick={() => ref.current?.showModal()}
      >
        {t("archive")}
      </button>
      <dialog className="dialog confirm-dialog" ref={ref}>
        <h2>{t("archive")}</h2>
        <p style={{ marginTop: 16 }}>{t("confirmArchive")}</p>
        {error && <p role="alert">{t(error)}</p>}
        <div className="dialog-actions">
          <button
            className="button button-outline"
            onClick={() => ref.current?.close()}
          >
            {t("cancel")}
          </button>
          <button
            className="button primary"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await archiveListing(id);
                if (r.error) setError(r.error);
                else {
                  ref.current?.close();
                  router.refresh();
                }
              })
            }
          >
            {t(pending ? "working" : "confirm")}
          </button>
        </div>
      </dialog>
    </>
  );
}
export function LogoutButton() {
  const t = useTranslations(),
    locale = useLocale();
  return (
    <form action={logout}>
      <input type="hidden" name="locale" value={locale} />
      <button className="button button-outline">{t("logout")}</button>
    </form>
  );
}
export function AccountForm({
  kind,
  initial = {},
}: {
  kind: "profile" | "business" | "security";
  initial?: Record<string, unknown>;
}) {
  const { locations, subtypes } = useCatalogConfig();
  const t = useTranslations(),
    l = useLocale() as Locale,
    router = useRouter(),
    [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      className="stack"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        start(async () => {
          const v = Object.fromEntries(form);
          const r =
            kind === "profile"
              ? await updateProfile(v)
              : kind === "business"
                ? await saveBusiness(v)
                : await changePassword(form);
          setError(r.error || "");
          setMessage(r.success || "");
          if (r.success && kind === "profile") router.refresh();
        });
      }}
    >
      {kind === "profile" ? (
        <>
          <label className="field">
            {t("name")}
            <input
              name="display_name"
              defaultValue={String(initial.display_name || "")}
              minLength={2}
              maxLength={80}
              required
            />
          </label>
          <label className="field">
            {t("bio")}
            <textarea
              name="bio"
              defaultValue={String(initial.bio || "")}
              maxLength={500}
            />
          </label>
          <p className="small-note">{t("publicProfileHint")}</p>
        </>
      ) : kind === "security" ? (
        <label className="field">
          {t("newPassword")}
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </label>
      ) : (
        <>
          <label className="field">
            {t("businessName")}
            <input
              name="name"
              minLength={2}
              maxLength={150}
              defaultValue={String(initial.name || "")}
              required
            />
          </label>
          <label className="field">
            {t("category")}
            <select
              name="category"
              defaultValue={String(
                initial.category || subtypes.businesses[0]?.[0] || "",
              )}
            >
              {subtypes.businesses.map(([s, en, zh]) => (
                <option key={s} value={s}>
                  {l === "zh" ? zh : en}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t("location")}
            <select
              name="location"
              defaultValue={String(initial.location || "nyc")}
            >
              {locations.map(([s, en, zh]) => (
                <option key={s} value={s}>
                  {l === "zh" ? zh : en}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            {t("businessDescription")}
            <textarea
              name="description"
              minLength={40}
              maxLength={3000}
              defaultValue={String(initial.description || "")}
              required
            />
          </label>
          <label className="field">
            {t("website")}
            <input
              name="website"
              type="url"
              pattern="https://.*"
              defaultValue={String(initial.website || "")}
            />
          </label>
          <p className="small-note">{t("businessPending")}</p>
        </>
      )}
      {error && (
        <p role="alert" className="field-error">
          {t(error)}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {t(message)}
        </p>
      )}
      <button className="button primary" disabled={pending}>
        {t(
          pending
            ? "working"
            : kind === "security"
              ? "updatePassword"
              : kind === "business"
                ? "businessSave"
                : "saveDraft",
        )}
      </button>
    </form>
  );
}
export function ReplyForm({ conversation }: { conversation: string }) {
  const t = useTranslations(),
    [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    router = useRouter();
  return (
    <form
      className="stack"
      style={{ marginTop: 20 }}
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const body = String(new FormData(form).get("body"));
        start(async () => {
          const r = await replyMessage({ conversation_id: conversation, body });
          setMessage(r.error || r.success || "");
          if (!r.error) {
            form.reset();
            router.refresh();
          }
        });
      }}
    >
      <label className="field">
        {t("reply")}
        <textarea name="body" minLength={10} maxLength={2000} required />
      </label>
      {message && <p role="status">{t(message)}</p>}
      <button className="button button-outline" disabled={pending}>
        {t(pending ? "working" : "sendMessage")}
      </button>
    </form>
  );
}
export function BusinessLogoUploader() {
  const t = useTranslations(),
    [pending, start] = useTransition(),
    [message, setMessage] = useState("");
  return (
    <form
      className="stack"
      style={{ marginTop: 28 }}
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        start(async () => {
          const file = form.get("file");
          if (!(file instanceof File)) return;
          try {
            const { compressPhoto } = await import("@/lib/images");
            form.set("file", await compressPhoto(file));
            const { uploadBusinessLogo } =
              await import("@/app/actions/account");
            const r = await uploadBusinessLogo(form);
            setMessage(r.error || r.success || "serverError");
          } catch {
            setMessage("photoError");
          }
        });
      }}
    >
      <label className="field">
        {t("businessLogo")}
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp"
          required
        />
      </label>
      <p className="small-note">{t("businessPending")}</p>
      {message && <p role="status">{t(message)}</p>}
      <button className="button button-outline" disabled={pending}>
        {t(pending ? "working" : "choosePhotos")}
      </button>
    </form>
  );
}
