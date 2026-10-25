import { test, expect } from "@playwright/test";
test("New York-only rollout hides other states and normalizes older state links and preferences", async ({
  page,
  context,
}) => {
  await context.addCookies([
    { name: "oofcourse_state", value: "CA", domain: "127.0.0.1", path: "/" },
  ]);
  await page.goto("/en?state=CA&location=old-area&page=2");
  await expect(page).toHaveURL(/state=NY/);
  expect(new URL(page.url()).searchParams.has("location")).toBe(false);
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  const state = page
    .locator(".site-header")
    .getByRole("combobox", { name: "State", exact: true });
  await expect(state).toHaveValue("NY");
  await expect(state.locator("option")).toHaveCount(1);
  await expect(state.locator("option")).toHaveText("New York");
  await expect(
    page.locator('main .hero-search select[name="state"] option'),
  ).toHaveCount(1);
  await page.locator('.category-card[href*="/housing"]').click();
  await expect(page).toHaveURL(/\/en\/housing\?state=NY/);
  await expect(page.locator(".catalog-header .eyebrow")).toHaveText("New York");
  const mobile = page.viewportSize()!.width < 761;
  if (mobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  const form = mobile
    ? page.getByRole("dialog").locator("form")
    : page.locator(".desktop-filter form");
  await form
    .getByRole("combobox", { name: "Location", exact: true })
    .selectOption("queens");
  await form
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/location=queens/);
  await expect(page).toHaveURL(/state=NY/);
  await page.reload();
  await expect(state).toHaveValue("NY");
  await page.goto("/en/post?state=TX");
  await expect(page).toHaveURL(/state=NY/);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.locator("main .form-grid select:not([name]) option"),
  ).toHaveCount(1);
  await expect(page.locator("main .form-grid select:not([name])")).toHaveValue(
    "NY",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
