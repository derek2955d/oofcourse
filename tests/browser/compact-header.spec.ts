import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("compact header controls retain choices, queries and keyboard access", async ({
  page,
}) => {
  await page.goto("/en/search?q=lamp&sort=newest&page=2");
  await expect(page.locator("main h1")).toBeVisible();
  const location = page
    .locator(".site-header")
    .getByRole("combobox", { name: "State", exact: true });
  await expect(location).toHaveValue("NY");
  expect((await location.boundingBox())!.width).toBeLessThanOrEqual(44);
  await location.selectOption("NJ");
  await expect(page).toHaveURL(/state=NJ/);
  expect(new URL(page.url()).searchParams.get("q")).toBe("lamp");
  expect(new URL(page.url()).searchParams.get("sort")).toBe("newest");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  await expect(location).toHaveValue("NJ");
  await expect(page.locator(".location-compact:visible")).toHaveAttribute(
    "title",
    /New Jersey/,
  );
  const control = page.locator(".language-switch").getByRole("button");
  await expect(control).toHaveText("");
  await expect(control).toHaveAttribute("aria-expanded", "false");
  await control.focus();
  await page.keyboard.press("Enter");
  await expect(control).toHaveAttribute("aria-expanded", "true");
  await expect(
    page
      .locator(".language-options")
      .getByRole("link", { name: "English", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  const openA11y = await new AxeBuilder({ page })
    .include(".site-header")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    openA11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(control).toBeFocused();
  await expect(control).toHaveAttribute("aria-expanded", "false");
  await control.click();
  await page.locator("main h1").click();
  await expect(control).toHaveAttribute("aria-expanded", "false");
  await control.click();
  await page
    .locator(".language-options")
    .getByRole("link", { name: "中文", exact: true })
    .click();
  await expect(page).toHaveURL(/\/zh\/search/);
  await expect(control).toHaveAttribute("aria-expanded", "false");
  expect(new URL(page.url()).searchParams.get("state")).toBe("NJ");
  expect(new URL(page.url()).searchParams.get("q")).toBe("lamp");
  await expect(
    page
      .locator(".site-header")
      .getByRole("combobox", { name: "州", exact: true }),
  ).toHaveValue("NJ");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("main h1")).toBeVisible();
  await page.screenshot({
    path: `test-results/compact-header-${page.viewportSize()!.width}.png`,
  });
  await control.click();
  await page.screenshot({
    path: `test-results/compact-language-open-${page.viewportSize()!.width}.png`,
  });
  await page.keyboard.press("Escape");
  const closedA11y = await new AxeBuilder({ page })
    .include(".site-header")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    closedA11y.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.failureSummary),
    })),
  ).toEqual([]);
});
