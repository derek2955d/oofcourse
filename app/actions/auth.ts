"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import {
  sessionDB,
  configured,
  requireUser,
  publicDB,
} from "@/lib/supabase/server";
import {
  passwordChangeInput,
  hasRecentRecoveryAuthentication,
  verifiedPasswordUpdate,
  passwordUpdateError,
} from "@/lib/password-security";
import { safeNext, siteOrigin } from "@/lib/security";
export type ActionResult = { error?: string; success?: string; id?: string };
export async function authenticate(
  mode: "login" | "signup" | "reset",
  form: FormData,
): Promise<ActionResult> {
  if (!configured()) return { error: "setupMessage" };
  const email = z.email().max(254).safeParse(form.get("email"));
  const locale = form.get("locale") === "zh" ? "zh" : "en";
  if (!email.success) return { error: "validation" };
  let next = "/account";
  try {
    const db = await sessionDB();
    if (mode === "reset") {
      const { error } = await db.auth.resetPasswordForEmail(email.data, {
        redirectTo: `${siteOrigin()}/auth/confirm?locale=${locale}&next=${encodeURIComponent("/account/security")}`,
      });
      return error ? { error: "serverError" } : { success: "resetSent" };
    }
    const password = z
      .string()
      .min(mode === "signup" ? 12 : 1)
      .max(128)
      .safeParse(form.get("password"));
    if (!password.success) return { error: "validation" };
    if (mode === "signup") {
      const name = z.string().trim().min(2).max(80).safeParse(form.get("name"));
      if (!name.success) return { error: "validation" };
      const { error } = await db.auth.signUp({
        email: email.data,
        password: password.data,
        options: {
          data: { display_name: name.data },
          emailRedirectTo: `${siteOrigin()}/auth/confirm?locale=${locale}&next=/account`,
        },
      });
      return error ? { error: "authError" } : { success: "verifyEmail" };
    }
    const { error } = await db.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    if (error) return { error: "authError" };
    next = safeNext(form.get("next"));
  } catch {
    return { error: "authError" };
  }
  redirect(`/${locale}${next}`);
}
export async function logout(form: FormData) {
  const locale = form.get("locale") === "zh" ? "zh" : "en";
  if (configured()) {
    const db = await sessionDB();
    await db.auth.signOut();
  }
  redirect(`/${locale}`);
}
export async function changePassword(form: FormData): Promise<ActionResult> {
  if (!(form instanceof FormData)) return { error: "validation" };
  const input = passwordChangeInput.safeParse({
    current_password: form.get("current_password") || "",
    password: form.get("password"),
    confirm_password: form.get("confirm_password"),
  });
  if (!input.success) {
    const specific = input.error.issues.find(
      (issue) => issue.code === "custom",
    )?.message;
    return { error: specific || "validation" };
  }
  let context;
  try {
    context = await requireUser();
  } catch {
    return { error: "authRequired" };
  }
  const { db, user } = context;
  let verifier: ReturnType<typeof publicDB> | undefined;
  let changed = false;
  try {
    const claims = await db.auth.getClaims();
    const recovery =
      !input.data.current_password &&
      !claims.error &&
      hasRecentRecoveryAuthentication(claims.data?.claims, user.id);
    const result = await verifiedPasswordUpdate(input.data, {
      userId: user.id,
      recentRecovery: recovery,
      verifyCurrent: async (password) => {
        if (!user.email) return null;
        verifier = publicDB(); // Isolated verification: never replace the member's session cookies.
        const { data, error } = await verifier.auth.signInWithPassword({
          email: user.email,
          password,
        });
        return !error && data.user ? data.user.id : null;
      },
      update: async (password) => {
        const { error } = await (verifier || db).auth.updateUser({
          password,
          ...(!recovery
            ? { current_password: input.data.current_password }
            : {}),
        });
        if (!error) return {};
        return { error: passwordUpdateError(error.code) };
      },
    });
    if (result.error) return result;
    changed = true;
    // Ask Supabase to revoke refresh sessions and clear this browser's auth cookies.
    // This does not claim immediate revocation of already issued access JWTs.
    const signedOut = await db.auth.signOut({ scope: "global" });
    if (signedOut.error)
      return {
        success: "passwordUpdated",
        error: "passwordSecurity.signOutRetry",
      };
    return { success: "passwordUpdated" };
  } catch {
    return changed
      ? { success: "passwordUpdated", error: "passwordSecurity.signOutRetry" }
      : { error: "passwordSecurity.updateFailed" };
  } finally {
    if (verifier) {
      try {
        await verifier.auth.signOut({ scope: "local" });
      } catch {
        /* No session credentials are persisted or logged. */
      }
    }
  }
}
