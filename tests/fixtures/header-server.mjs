// Isolated UI integration fixture. Never connects to hosted Auth or a real user.
import http from "node:http";
import { spawn } from "node:child_process";
const uid = "00000000-0000-4000-8000-000000000001";
const expires = Math.floor(Date.now() / 1000) + 3600;
const encode = (data) =>
  Buffer.from(JSON.stringify(data)).toString("base64url");
export const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: uid, exp: expires, role: "authenticated" })}.isolated-signature`;
let displayName = "Header Test 用户";
let headerReadsAfterUpdate = 0;
const user = {
  id: uid,
  aud: "authenticated",
  role: "authenticated",
  email: "header@example.test",
  email_confirmed_at: "2026-10-25T00:00:00Z",
  created_at: "2026-10-25T00:00:00Z",
  app_metadata: { provider: "email" },
  user_metadata: { display_name: "Registration Name" },
};
const sessionPayload = () => ({
  access_token: token,
  refresh_token: "isolated-refresh-token",
  token_type: "bearer",
  expires_in: 3600,
  expires_at: expires,
  user,
});
const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/fixture/profile") {
    res.end(
      JSON.stringify({ display_name: displayName, headerReadsAfterUpdate }),
    );
    return;
  }
  if (req.url === "/fixture/session") {
    displayName = "Header Test 用户";
    res.end(JSON.stringify(sessionPayload()));
    return;
  }
  if (
    req.method === "POST" &&
    req.url === "/auth/v1/token?grant_type=password"
  ) {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const input = JSON.parse(raw);
    if (
      input.email !== user.email ||
      input.password !== "Header-test-password-123"
    ) {
      res.writeHead(400);
      res.end(
        JSON.stringify({ message: "Invalid isolated fixture credentials" }),
      );
      return;
    }
    res.end(JSON.stringify(sessionPayload()));
    return;
  }
  if (req.url?.startsWith("/auth/v1/")) {
    if (req.headers.authorization !== `Bearer ${token}`) {
      res.writeHead(401);
      res.end(
        JSON.stringify({ code: "bad_jwt", message: "Invalid isolated token" }),
      );
      return;
    }
    if (req.url.startsWith("/auth/v1/user")) {
      res.end(JSON.stringify(user));
      return;
    }
    if (req.url.startsWith("/auth/v1/logout")) {
      res.writeHead(204);
      res.end();
      return;
    }
  }
  if (
    req.url?.startsWith("/rest/v1/profiles") &&
    req.headers.authorization === `Bearer ${token}`
  ) {
    if (req.method === "PATCH") {
      let body = "";
      for await (const chunk of req) body += chunk;
      displayName = JSON.parse(body).display_name;
      headerReadsAfterUpdate = 0;
      res.writeHead(204);
      res.end();
      return;
    }
    if (
      displayName.startsWith("Updated") &&
      new URL(req.url, "http://localhost").searchParams.get("select") ===
        "display_name"
    )
      headerReadsAfterUpdate++;
    const row = { id: uid, display_name: displayName, bio: "" };
    res.end(
      JSON.stringify(
        req.headers.accept?.includes("application/vnd.pgrst.object+json")
          ? row
          : [row],
      ),
    );
    return;
  }
  // No fabricated public catalogs, listings, messages or accounts are returned.
  res.writeHead(400);
  res.end(
    JSON.stringify({ message: "Not supplied by isolated navigation fixture" }),
  );
});
server.listen(3601, "127.0.0.1", () => {
  const next = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3104",
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3601",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          "sb_publishable_isolated_header_fixture",
      },
    },
  );
  next.on("exit", () => server.close());
  const stop = () => {
    next.kill("SIGTERM");
    server.close();
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
});
