import "server-only";
import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
import { sessionCookieOptions } from "./cookie-policy";
export const configured = () => Boolean(supabaseConfig());
export function publicDB() {
  const config = supabaseConfig();
  if (!config) throw new Error("setupMessage");
  return createClient(config.url, config.key, {
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function sessionDB() {
  const config = supabaseConfig();
  if (!config) throw new Error("setupMessage");
  const [jar, requestHeaders] = await Promise.all([cookies(), headers()]);
  return createServerClient(config.url, config.key, {
    cookieOptions: sessionCookieOptions({
      vercel: process.env.VERCEL,
      forwardedProto: requestHeaders.get("x-forwarded-proto"),
    }),
    // Session-scoped rows, including the current profile, must never be cached.
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => {
        try {
          items.forEach(({ name, value, options }) =>
            jar.set(name, value, options),
          );
        } catch {
          /* Read-only Server Component; proxy refreshes the session. */
        }
      },
    },
  });
}
export async function requireUser() {
  const db = await sessionDB();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) throw new Error("authRequired");
  return { db, user };
}
export async function requireAdmin() {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("adminOnly");
  return { db, user };
}
