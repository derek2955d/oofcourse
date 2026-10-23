import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET,
    url = process.env.NEXT_PUBLIC_SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 32 || !url || !key)
    return NextResponse.json(
      { error: "Automation is not configured." },
      { status: 503 },
    );
  const provided = request.headers.get("authorization") || "",
    expected = `Bearer ${secret}`;
  if (
    Buffer.byteLength(provided) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  )
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.rpc("expire_content");
  return error
    ? NextResponse.json({ error: "Expiry job failed." }, { status: 500 })
    : NextResponse.json({ expired: data });
}
