import test from "node:test";
import assert from "node:assert/strict";
import { parseSupabaseConfig } from "../lib/supabase/config";
test("malformed Supabase configuration fails closed before client construction", () => {
  for (const url of [
    undefined,
    "https://…supabase.co",
    "NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co",
    "not-a-url",
    "ftp://example.com",
    "https://user:password@example.com",
    "https://example.com/path",
  ])
    assert.equal(parseSupabaseConfig(url, "sb_publishable_fixture"), null);
  assert.equal(
    parseSupabaseConfig("https://example.supabase.co", "sb_secret_fixture"),
    null,
  );
  assert.deepEqual(
    parseSupabaseConfig(
      " https://example.supabase.co/ ",
      " sb_publishable_fixture ",
    ),
    { url: "https://example.supabase.co", key: "sb_publishable_fixture" },
  );
});
