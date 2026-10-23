"use server";
import { z } from "zod";
import { redirect } from "next/navigation";
import { sessionDB, configured, requireUser } from "@/lib/supabase/server";
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
  try {
    const password = z.string().min(12).max(128).parse(form.get("password"));
    const { db } = await requireUser();
    const { error } = await db.auth.updateUser({ password });
    return error ? { error: "serverError" } : { success: "passwordUpdated" };
  } catch {
    return { error: "authRequired" };
  }
}
