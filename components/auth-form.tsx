"use client";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { authenticate } from "@/app/actions/auth";
export function AuthForm({
  mode,
  connected,
}: {
  mode: "login" | "signup" | "reset";
  connected: boolean;
}) {
  const t = useTranslations(),
    l = useLocale(),
    params = useSearchParams(),
    [pending, start] = useTransition(),
    [error, setError] = useState(
      params.get("error") === "authError" ? "authError" : "",
    ),
    [success, setSuccess] = useState("");
  return (
    <>
      {success ? (
        <div className="notice" role="status">
          {t(success)}
        </div>
      ) : (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            data.set("locale", l);
            data.set("next", params.get("next") || "/account");
            start(async () => {
              const r = await authenticate(mode, data);
              setError(r.error || "");
              setSuccess(r.success || "");
            });
          }}
        >
          {mode === "signup" && (
            <label className="field">
              {t("name")}
              <input
                name="name"
                autoComplete="nickname"
                minLength={2}
                maxLength={80}
                required
              />
            </label>
          )}
          <label className="field">
            {t("email")}
            <input
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          {mode !== "reset" && (
            <label className="field">
              {t("password")}
              <input
                name="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                minLength={mode === "signup" ? 12 : 1}
                maxLength={128}
                required
              />
              {mode === "signup" && (
                <small>
                  {l === "zh"
                    ? "至少 12 个字符，建议使用密码管理器。"
                    : "At least 12 characters. A password manager is recommended."}
                </small>
              )}
            </label>
          )}
          {error && (
            <p role="alert" className="field-error">
              {t(error)}
            </p>
          )}
          <button className="button primary" disabled={pending || !connected}>
            {t(
              pending
                ? "working"
                : mode === "signup"
                  ? "signup"
                  : mode === "reset"
                    ? "sendReset"
                    : "login",
            )}
          </button>
        </form>
      )}
      <div className="auth-links">
        {mode === "login" ? (
          <>
            <Link href="/signup">{t("noAccount")}</Link>
            <Link href="/reset-password">{t("forgot")}</Link>
          </>
        ) : (
          <Link href="/login">
            {t("hasAccount")} {t("login")}
          </Link>
        )}
      </div>
    </>
  );
}
