// Explicit, read-only account smoke test. Never enable traces or persist sessions.
import { chromium, expect } from "@playwright/test";
import { combineChunks, createChunks } from "@supabase/ssr";

async function main() {
  for (const name of ["TEST_USER_EMAIL", "TEST_USER_PASSWORD"])
    if (!process.env[name]) throw new Error(`Missing ${name}`);
  const origin = new URL(
    process.env.AUTH_TEST_BASE_URL || "http://localhost:3000",
  );
  if (
    !["localhost", "127.0.0.1"].includes(origin.hostname) ||
    !["http:", "https:"].includes(origin.protocol) ||
    origin.username ||
    origin.password ||
    origin.search ||
    origin.hash ||
    origin.pathname !== "/"
  )
    throw new Error("Use a trusted loopback production build for this test");

  const browser = await chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_EXECUTABLE_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext();
  // Do not allow a redirect regression to send credentials to another origin.
  await context.route("**/*", (route) =>
    new URL(route.request().url()).origin === origin.origin
      ? route.continue()
      : route.abort(),
  );
  const page = await context.newPage();
  let stage = "login",
    signedIn = false;
  const passed: string[] = [];
  try {
    await page.goto(`${origin.origin}/en/login?next=%2F%2Fexample.invalid`);
    await page
      .locator('input[name="email"]')
      .fill(process.env.TEST_USER_EMAIL!);
    await page
      .locator('input[name="password"]')
      .fill(process.env.TEST_USER_PASSWORD!);
    await page.locator(".auth-submit").click();
    await page.waitForURL(`${origin.origin}/en/account`);
    await expect(page.locator(".dashboard")).toBeVisible();
    signedIn = true;
    passed.push("real login and safe return URL");

    stage = "session cookie privacy";
    const cookies = (await context.cookies()).filter((c) =>
      /^sb-.*-auth-token(?:\.\d+)?$/.test(c.name),
    );
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.every((c) => c.httpOnly && c.sameSite === "Lax")).toBe(true);
    expect(
      await page.evaluate(() =>
        /(?:^|;\s*)sb-[^=]*-auth-token/.test(document.cookie),
      ),
    ).toBe(false);
    passed.push("HttpOnly cookies are not readable by page JavaScript");

    stage = "server-side refresh";
    const key = cookies[0].name.replace(/\.\d+$/, "");
    const encoded = await combineChunks(
      key,
      (name) => cookies.find((c) => c.name === name)?.value,
    );
    if (!encoded?.startsWith("base64-"))
      throw new Error("Unsupported session encoding");
    const session = JSON.parse(
      Buffer.from(encoded.slice(7), "base64url").toString("utf8"),
    );
    session.expires_at = 1; // Force a refresh using this account's real refresh token.
    const expired =
      "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url");
    await context.clearCookies({
      name: new RegExp(
        `^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\.\\d+)?$`,
      ),
    });
    await context.addCookies(
      createChunks(key, expired).map((chunk) => ({ ...cookies[0], ...chunk })),
    );
    await page.goto(`${origin.origin}/en/account/profile`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator(".dashboard")).toBeVisible();
    const renewed = (await context.cookies()).filter(
      (c) => c.name === key || c.name.startsWith(key + "."),
    );
    expect(renewed.every((c) => c.httpOnly && c.sameSite === "Lax")).toBe(true);
    const fresh = await combineChunks(
      key,
      (name) => renewed.find((c) => c.name === name)?.value,
    );
    const freshSession = JSON.parse(
      Buffer.from(fresh!.slice(7), "base64url").toString("utf8"),
    );
    expect(freshSession.expires_at).toBeGreaterThan(
      Math.floor(Date.now() / 1000),
    );
    passed.push(
      "real token refresh retains HttpOnly and the authenticated workspace",
    );

    stage = "locale and reload";
    await page.locator(".language-switch button").click();
    await page.locator('.language-options a[lang="zh-CN"]').click();
    await page.waitForURL(`${origin.origin}/zh/account/profile`);
    await expect(page.locator(".header-account")).toBeVisible();
    await page.reload();
    await expect(page.locator(".dashboard")).toBeVisible();
    passed.push("language switching and reload retain authentication");

    stage = "anonymous cache isolation";
    const guestContext = await browser.newContext();
    try {
      const guest = await guestContext.newPage();
      await guest.goto(`${origin.origin}/zh/account/profile`, {
        waitUntil: "networkidle",
      });
      await expect(guest.locator(".dashboard")).toHaveCount(0);
      await expect(guest.locator(".header-account")).toHaveCount(0);
    } finally {
      await guestContext.close();
    }
    passed.push("an anonymous window cannot reuse the account workspace");

    stage = "logout";
    await page.goto(`${origin.origin}/zh/account/security`, {
      waitUntil: "networkidle",
    });
    await page.locator("form button").filter({ hasText: "退出登录" }).click();
    await page.waitForURL(`${origin.origin}/zh`);
    signedIn = false;
    await page.goto(`${origin.origin}/zh/account/profile`, {
      waitUntil: "networkidle",
    });
    await expect(page.locator(".dashboard")).toHaveCount(0);
    expect(
      (await context.cookies()).some((c) =>
        /^sb-.*-auth-token(?:\.\d+)?$/.test(c.name),
      ),
    ).toBe(false);
    passed.push(
      "logout clears authentication cookies and denies private routes",
    );
    console.log(JSON.stringify({ passed }));
  } catch {
    // Playwright error messages/step arguments can contain entered credentials.
    console.error(JSON.stringify({ passed, failedStage: stage }));
    process.exitCode = 1;
  } finally {
    if (signedIn) {
      try {
        await page.goto(`${origin.origin}/zh/account/security`);
        await page
          .locator("form button")
          .filter({ hasText: "退出登录" })
          .click();
        await page.waitForURL(`${origin.origin}/zh`);
      } catch {
        console.error("Test-session logout could not be confirmed");
      }
    }
    await context.close();
    await browser.close();
  }
}

main().catch(() => {
  console.error(
    "Auth-security test prerequisites failed; no credentials were logged",
  );
  process.exitCode = 1;
});
