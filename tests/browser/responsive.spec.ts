import { test, expect } from "@playwright/test";
test("responsive home, category-specific lists, detail layouts, posting and locked admin", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const width = page.viewportSize()!.width;
  const routes = [
    "/en",
    "/zh/housing",
    "/en/jobs",
    "/zh/preview/housing",
    "/en/preview/jobs",
    "/zh/post",
    "/zh/admin",
  ];
  for (const route of routes) {
    const r = await page.goto(route);
    expect(r?.status(), route).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${route} at ${width}`,
    ).toBe(true);
  }
  for (const locale of width === 390 || width === 1440
    ? ["en", "zh"]
    : ["en"]) {
    await page.goto(`/${locale}`);
    for (const img of await page.locator("main img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty("complete", true);
      expect(
        await img.evaluate((i: HTMLImageElement) => i.naturalWidth),
      ).toBeGreaterThan(0);
    }
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/home-${locale}-${width}.png`,
      fullPage: true,
    });
    if (width === 390)
      await page.screenshot({
        path: `test-results/home-${locale}-mobile-top.png`,
      });
  }
  if (width === 1440 || width === 390) {
    await page.goto("/zh/preview/housing");
    await page.screenshot({
      path: `test-results/detail-zh-${width}.png`,
      fullPage: true,
    });
  }
  expect(info.project.name).toContain(String(width));
});
