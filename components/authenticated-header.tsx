import { cookies } from "next/headers";
import { configured, requireUser } from "@/lib/supabase/server";
import { SiteHeader } from "./navigation";

export async function AuthenticatedHeader() {
  let viewer: { displayName: string | null } | null = null;
  // Always mark personalized navigation as request-time, even without configuration.
  const jar = await cookies();
  if (
    configured() &&
    jar.getAll().some((cookie) => cookie.name.startsWith("sb-"))
  ) {
    try {
      // Verify the session on the server; a cookie alone is not an identity.
      const { db, user } = await requireUser();
      const { data } = await db
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle();
      const name = data?.display_name || user.user_metadata?.display_name;
      viewer = {
        displayName:
          typeof name === "string" ? name.trim().slice(0, 80) || null : null,
      };
    } catch {
      // Missing, expired or invalid sessions keep the signed-out navigation.
    }
  }
  return <SiteHeader viewer={viewer} />;
}
