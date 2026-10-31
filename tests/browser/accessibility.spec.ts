import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("automated WCAG AA checks for bilingual home, filters, detail, form and locked admin", async ({
  page,
}) => {
  test.setTimeout(240000);
  for (const path of [
    "/en",
    "/zh",
    "/zh/housing",
    "/en/preview/jobs",
    "/zh/post",
    "/en/admin",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      path,
    ).toEqual([]);
  }
});
