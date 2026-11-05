import { NextRequest, NextResponse } from "next/server";
import { sessionDB, configured } from "@/lib/supabase/server";
import { safeNext } from "@/lib/security";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const locale = q.get("locale") === "zh" ? "zh" : "en";
  if (configured() && q.get("code")) {
    const db = await sessionDB();
    const { error } = await db.auth.exchangeCodeForSession(q.get("code")!);
    if (!error)
      return NextResponse.redirect(
        new URL(`/${locale}${safeNext(q.get("next"))}`, request.url),
      );
  }
  return NextResponse.redirect(
    new URL(`/${locale}/login?error=authError`, request.url),
  );
}
