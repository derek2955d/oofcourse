import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("bilingual auth layouts, password visibility and existing navigation", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const locale of ["en", "zh"]) {
    for (const mode of ["login", "signup", "reset-password"]) {
      const response = await page.goto(
        `/${locale}/${mode}?next=/account/saved`,
      );
      expect(response?.status()).toBe(200);
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator('input[name="email"]')).toHaveAttribute(
        "type",
        "email",
      );
      if (mode !== "reset-password") {
        const input = page.locator('input[name="password"]');
        await input.fill("Private-test-password");
        await page
          .getByRole("button", {
            name: locale === "en" ? "Show password" : "显示密码",
            exact: true,
          })
          .click();
        await expect(input).toHaveAttribute("type", "text");
        await page
          .getByRole("button", {
            name: locale === "en" ? "Hide password" : "隐藏密码",
            exact: true,
          })
          .click();
        await expect(input).toHaveAttribute("type", "password");
      }
    }
    await page.goto(`/${locale}/login?next=/account/saved`);
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.screenshot({
      path: `test-results/auth-${locale}-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.failureSummary),
      })),
    ).toEqual([]);
  }
  await page.goto("/en/login?next=/account/saved");
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "中文", exact: true })
    .click();
  await expect(page).toHaveURL(/\/zh\/login\?next=/);
});
