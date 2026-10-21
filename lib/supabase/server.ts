import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
export function databaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
export async function supabaseServer() {
  if (!databaseConfigured()) throw new Error("Supabase is not configured.");
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (items) => {
          try {
            for (const { name, value, options } of items)
              jar.set(name, value, options);
          } catch {
            /* Server Component reads cannot persist refresh cookies. Actions can. */
          }
        },
      },
    },
  );
}
export async function requireAdmin() {
  const client = await supabaseServer();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error("Authentication required.");
  const { data: membership } = await client
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membership?.role !== "admin")
    throw new Error("Administrator access required.");
  return client;
}
