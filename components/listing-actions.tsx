"use client";
import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Heart, Share2, Flag, MessageCircle, X } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import {
  toggleFavorite,
  submitReport,
  sendContact,
} from "@/app/actions/listings";
export function ShareButton() {
  const t = useTranslations(),
    [message, setMessage] = useState("");
  return (
    <>
      <button
        className="icon-button"
        aria-label={t("share")}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setMessage(t("copied"));
          } catch {
            setMessage(t("copyFailed"));
          }
        }}
      >
        <Share2 size={18} />
      </button>
      <span className="action-feedback" role="status">
        {message}
      </span>
    </>
  );
}
export function FavoriteButton({
  id,
  initial = false,
  preview = false,
}: {
  id: string;
  initial?: boolean;
  preview?: boolean;
}) {
  const t = useTranslations(),
    router = useRouter(),
    [saved, setSaved] = useState(initial),
    [pending, start] = useTransition(),
    [message, setMessage] = useState("");
  return (
    <>
      <button
        className="button button-outline"
        disabled={preview || pending}
        aria-label={t(saved ? "unsave" : "save")}
        aria-pressed={saved}
        title={preview ? t("previewUnavailable") : undefined}
        onClick={() =>
          start(async () => {
            const result = await toggleFavorite(id, !saved);
            if (result.error === "authRequired")
              router.push("/login?next=/saved");
            else if (result.error) setMessage(t(result.error));
            else setSaved(!saved);
          })
        }
      >
        <Heart size={17} fill={saved ? "currentColor" : "none"} />
        {t(saved ? "saved" : "save")}
      </button>
      {message && (
        <p className="field-error" role="status">
          {message}
        </p>
      )}
    </>
  );
}
export function ListingDialog({
  kind,
  id,
  preview = false,
}: {
  kind: "report" | "contact";
  id: string;
  preview?: boolean;
}) {
  const t = useTranslations(),
    ref = useRef<HTMLDialogElement>(null),
    [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const contact = kind === "contact";
  return (
    <>
      <button
        className={contact ? "button primary" : "text-link"}
        disabled={preview}
        title={preview ? t("previewUnavailable") : undefined}
        onClick={() => ref.current?.showModal()}
      >
        {contact ? <MessageCircle size={17} /> : <Flag size={14} />}{" "}
        {t(contact ? "contactPublisher" : "report")}
      </button>
      <dialog ref={ref} className="dialog">
        <div className="dialog-top">
          <h2>{t(contact ? "contactPublisher" : "report")}</h2>
          <button
            className="icon-button"
            onClick={() => ref.current?.close()}
            aria-label={t("navClose")}
          >
            <X size={18} />
          </button>
        </div>
        {message ? (
          <p role="status">{message}</p>
        ) : (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              start(async () => {
                const r = contact
                  ? await sendContact({
                      listing_id: id,
                      body: String(form.get("body")),
                    })
                  : await submitReport({
                      listing_id: id,
                      reason: String(form.get("reason")),
                      description: String(form.get("body")),
                    });
                if (r.error) setError(r.error);
                else {
                  setError("");
                  setMessage(t(contact ? "messageSent" : "reportSent"));
                }
              });
            }}
          >
            <p>{t("contactHint")}</p>
            {!contact && (
              <label className="field">
                {t("reportReason")}
                <select name="reason" required>
                  {[
                    "scam",
                    "discrimination",
                    "prohibited",
                    "misleading",
                    "privacy",
                    "other",
                  ].map((v) => (
                    <option key={v} value={v}>
                      {t(v === "privacy" ? "privacyReason" : v)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="field">
              {t(contact ? "message" : "description")}
              <textarea name="body" minLength={10} maxLength={2000} required />
            </label>
            {error && (
              <p role="alert" className="field-error">
                {t(error)}
                {error === "authRequired" && (
                  <>
                    {" "}
                    <Link className="text-link" href="/login">
                      {t("login")}
                    </Link>
                  </>
                )}
              </p>
            )}
            <button className="button primary" disabled={pending}>
              {t(
                pending ? "working" : contact ? "sendMessage" : "submitReport",
              )}
            </button>
          </form>
        )}
      </dialog>
    </>
  );
}
