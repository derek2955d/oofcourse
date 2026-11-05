import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("verified identity replaces login, opens account, updates nickname and clears on logout", async ({
  page,
  context,
  request,
}) => {
  const session = await (
    await request.get("http://127.0.0.1:3601/fixture/session")
  ).json();
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" + Buffer.from(JSON.stringify(session)).toString("base64url"),
      domain: "127.0.0.1",
      path: "/",
      sameSite: "Lax",
    },
  ]);
  await page.goto("/zh");
  const header = page.locator(".site-header");
  await expect(
    header.getByRole("link", { name: "登录", exact: true }),
  ).toHaveCount(0);
  const account = header.locator(".header-account:visible");
  await expect(account).toHaveText("HHeader Test 用户");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/zh");
  await expect(header.locator(".header-account:visible")).toBeVisible();
  await expect(page.locator("main h1")).toBeVisible();
  await page.screenshot({
    path: `test-results/header-signed-in-${page.viewportSize()!.width}.png`,
  });
  const a11y = await new AxeBuilder({ page })
    .include(".site-header")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    a11y.violations.map((x) => ({
      id: x.id,
      nodes: x.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
  await account.click();
  await expect(page).toHaveURL("/zh/account");
  await page.goto("/zh/account/profile");
  await page
    .locator('input[name="display_name"]')
    .fill(`Updated 昵称 ${"x".repeat(55)}`);
  await page.locator("main form").getByRole("button").click();
  await expect(page.locator("main form").getByRole("button")).toBeEnabled({
    timeout: 30000,
  });
  await expect(page.locator("main").getByRole("status")).toHaveText(
    "修改已保存。",
  );
  const profile = await (
    await request.get("http://127.0.0.1:3601/fixture/profile")
  ).json();
  expect(profile.display_name).toContain("Updated 昵称");
  await expect(header.locator(".header-account:visible")).toContainText(
    "Updated 昵称",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/en");
  await expect(header.locator(".header-account:visible")).toContainText(
    "Updated 昵称",
  );
  await page.goto("/en/account/security");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL("/en");
  await expect(header.locator(".header-account")).toHaveCount(0);
  if (page.viewportSize()!.width < 761)
    await header
      .getByRole("button", { name: "Open navigation", exact: true })
      .click();
  await expect(
    header.getByRole("link", { name: "Log in", exact: true }),
  ).toBeVisible();
});
test("an unverified cookie does not impersonate a member", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value:
        "base64-" +
        Buffer.from(
          JSON.stringify({
            access_token: "forged-token",
            refresh_token: "invalid",
            user: { user_metadata: { display_name: "Forged Name" } },
          }),
        ).toString("base64url"),
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
  await page.goto("/en");
  await expect(page.locator(".header-account")).toHaveCount(0);
  await expect(page.locator(".site-header")).not.toContainText("Forged Name");
});

test("signing in refreshes the header without a manual reload", async ({
  page,
  request,
}) => {
  await request.get("http://127.0.0.1:3601/fixture/session");
  await page.goto("/en/login");
  await page.locator('input[name="email"]').fill("header@example.test");
  await page.locator('input[name="password"]').fill("Header-test-password-123");
  await page
    .locator("main")
    .getByRole("button", { name: "Log in", exact: true })
    .click();
  await expect(page).toHaveURL("/en/account", { timeout: 30000 });
  await expect(
    page.locator(".site-header .header-account:visible"),
  ).toContainText("Header Test 用户");
  await expect(
    page
      .locator(".site-header")
      .getByRole("link", { name: "Log in", exact: true }),
  ).toHaveCount(0);
});
