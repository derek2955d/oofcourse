import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./config";
export const configured = () => Boolean(supabaseConfig());
export function publicDB() {
  const config = supabaseConfig();
  if (!config) throw new Error("setupMessage");
  return createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export async function sessionDB() {
  const config = supabaseConfig();
  if (!config) throw new Error("setupMessage");
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
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
