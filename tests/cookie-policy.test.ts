import test from "node:test";
import assert from "node:assert/strict";
import { sessionCookieOptions } from "../lib/supabase/cookie-policy";

test("server sessions are HttpOnly and Lax on every transport, including local HTTP", () => {
  for (const context of [
    {},
    { protocol: "http:" },
    { protocol: "https:" },
    { vercel: "1" },
  ]) {
    const policy = sessionCookieOptions(context);
    assert.equal(policy.httpOnly, true);
    assert.equal(policy.sameSite, "lax");
    assert.equal(policy.path, "/");
  }
  assert.equal(sessionCookieOptions({ protocol: "http:" }).secure, false);
});

test("HTTPS sessions are Secure and a spoofed HTTP header cannot downgrade Vercel", () => {
  assert.equal(sessionCookieOptions({ protocol: "https:" }).secure, true);
  assert.equal(
    sessionCookieOptions({ forwardedProto: " HTTPS, http" }).secure,
    true,
  );
  assert.equal(
    sessionCookieOptions({
      vercel: "1",
      protocol: "http:",
      forwardedProto: "http",
    }).secure,
    true,
  );
  assert.equal(
    sessionCookieOptions({ forwardedProto: "https.evil" }).secure,
    false,
  );
});
