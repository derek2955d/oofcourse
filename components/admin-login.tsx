"use client";
import { useState } from "react";
import { useLocale } from "./locale-provider";
import { tr } from "@/lib/i18n/admin";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/admin/actions";
export function AdminLogin() {
  const locale = useLocale();
  const [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <form
      className="admin-login"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError("");
        const result = await loginAdmin(new FormData(e.currentTarget));
        setPending(false);
        if (result.error) setError(tr(locale, result.error));
        else router.refresh();
      }}
    >
      <label>
        {tr(locale, "Administrator email")}{" "}
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        {tr(locale, "Password")}{" "}
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button className="button primary" disabled={pending}>
        {pending ? tr(locale, "Signing in…") : tr(locale, "Sign in securely")}
      </button>
      <p>
        {tr(
          locale,
          "No self-service administrator registration. Membership must be provisioned through a trusted server or SQL console.",
        )}{" "}
      </p>
    </form>
  );
}
