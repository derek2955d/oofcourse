"use client";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Link } from "@/i18n/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
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
    [showPassword, setShowPassword] = useState(false),
    [error, setError] = useState(
      params.get("error") === "authError" ? "authError" : "",
    ),
    [success, setSuccess] = useState("");
  return (
    <>
      {mode === "login" && params.get("passwordChanged") === "1" && (
        <p className="notice" role="status">
          {t("passwordSecurity.signInAgain")}
        </p>
      )}
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
                placeholder={t("authDesign.namePlaceholder")}
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
              placeholder={t("authDesign.emailPlaceholder")}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </label>
          {mode !== "reset" && (
            <div className="field auth-password-field">
              <label htmlFor="auth-password">{t("password")}</label>
              <div className="auth-password-input">
                <input
                  id="auth-password"
                  placeholder={t("authDesign.passwordPlaceholder")}
                  aria-describedby={
                    mode === "signup" ? "auth-password-hint" : undefined
                  }
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  minLength={mode === "signup" ? 12 : 1}
                  maxLength={128}
                  required
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  aria-label={t(
                    showPassword ? "authDesign.hide" : "authDesign.show",
                  )}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {mode === "signup" && (
                <small id="auth-password-hint">
                  {l === "zh"
                    ? "至少 12 个字符，建议使用密码管理器。"
                    : "At least 12 characters. A password manager is recommended."}
                </small>
              )}
            </div>
          )}
          {error && (
            <p role="alert" className="field-error">
              {t(error)}
            </p>
          )}
          {!connected && (
            <p className="auth-unavailable" role="status">
              {t("authDesign.unavailable")}
            </p>
          )}
          <button
            className="button primary auth-submit"
            disabled={pending || !connected}
          >
            {t(
              pending
                ? "working"
                : mode === "signup"
                  ? "signup"
                  : mode === "reset"
                    ? "sendReset"
                    : "login",
            )}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
      {mode === "signup" && (
        <p className="auth-terms">
          {t("authDesign.signupNote")}{" "}
          <Link href="/terms">{t("authDesign.terms")}</Link>{" "}
          {t("authDesign.and")}{" "}
          <Link href="/privacy">{t("authDesign.privacy")}</Link>
          {l === "zh" ? "。" : "."}
        </p>
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
