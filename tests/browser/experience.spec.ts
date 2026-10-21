import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function noOverflow(page: import("@playwright/test").Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
test("product-first bilingual home, original images and responsive screenshots", async ({
  page,
}, info) => {
  for (const locale of ["en", "zh"]) {
    await page.goto(`/${locale}`);
    await expect(page.locator("h1")).toContainText(
      locale === "en" ? "Great Deals?" : "好物好价",
    );
    await expect(page.locator(".product-card")).toHaveCount(12);
    await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0);
    await expect(page.locator(".product-price")).toHaveCount(0);
    await expect(page.locator(".store-card")).toHaveCount(0);
    for (const img of await page.locator("main img").all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveJSProperty("complete", true);
      expect(
        await img.evaluate((i: HTMLImageElement) => i.naturalWidth),
      ).toBeGreaterThan(0);
    }
    await noOverflow(page);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: `test-results/home-${locale}-${info.project.name}.png`,
      fullPage: true,
    });
  }
});
test("bilingual search, composed filters, sorting and empty state work", async ({
  page,
}) => {
  await page.goto("/en");
  await page
    .getByRole("searchbox", { name: "Search deals", exact: true })
    .fill("耳机");
  await page.getByRole("button", { name: "Submit search" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText(
    "Studio Wireless Headphones",
  );
  await page.getByRole("link", { name: "中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh\/search\?q=/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-card h3 a").click();
  await expect(page.locator("h1")).toContainText("耳机");
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0);
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/deals\/studio-wireless-headphones/);
  await page.goto("/en/deals");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("baby");
  await page
    .getByRole("combobox", { name: "Retailer", exact: true })
    .selectOption("walmart");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/en/category/fashion");
  await expect(
    page.getByRole("heading", { name: "No finds just yet." }),
  ).toBeVisible();
  await page.goto("/en/deals?sort=name");
  await expect(page.locator(".product-card h3").first()).toHaveText(
    "Cozy Pet Bed",
  );
});
test("favorites survive language changes and reload; mobile navigation works", async ({
  page,
}, info) => {
  await page.goto("/en/deals");
  await page
    .getByRole("button", {
      name: "Save Studio Wireless Headphones",
      exact: true,
    })
    .click();
  await page.goto("/zh/saved");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL("/en/saved");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("button", {
      name: "Unsave Studio Wireless Headphones",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your favorites start here." }),
  ).toBeVisible();
  if (info.project.name !== "desktop") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Buying Guides", exact: true })
      .click();
    await expect(page).toHaveURL("/en/guides");
  }
  await noOverflow(page);
});
test("required bilingual routes, SEO, PWA, redirects, 404 and server-action authorization", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  for (const l of ["en", "zh"])
    for (const p of [
      "",
      "/deals",
      "/categories",
      "/category/baby",
      "/stores",
      "/stores/amazon",
      "/guides",
      "/guides/small-space-favorites",
      "/saved",
      "/deals/studio-wireless-headphones",
      "/search",
      "/about",
      "/contact",
      "/privacy",
      "/affiliate-disclosure",
      "/terms",
      "/admin",
    ]) {
      const path = `/${l}${p}`;
      expect((await page.goto(path))?.status(), path).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute(
        "lang",
        l === "en" ? "en-US" : "zh-CN",
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://oofcourse.com${path}`,
      );
      await expect(page.locator('link[hreflang="en-US"]')).toHaveAttribute(
        "href",
        `https://oofcourse.com/en${p}`,
      );
      await expect(page.locator('link[hreflang="zh-CN"]')).toHaveAttribute(
        "href",
        `https://oofcourse.com/zh${p}`,
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
      await noOverflow(page);
    }
  for (const p of [
    "/en/deals/missing",
    "/zh/category/missing",
    "/en/stores/missing",
    "/zh/guides/missing",
  ])
    expect((await request.get(p)).status()).toBe(404);
  const redirect = await request.get("/search?q=test", { maxRedirects: 0 });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toContain("/en/search?q=test");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/zh/guides/");
  expect(sitemap).not.toContain("/deals/");
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.start_url).toBe("/en");
  const refs = JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8"),
  );
  const action = Object.entries(refs.node).find(
    ([, v]) =>
      (v as { exportedName: string }).exportedName === "saveAdminRecord",
  )?.[0];
  expect(action).toBeTruthy();
  const denied = await request.post("/en/admin", {
    headers: {
      "Next-Action": action!,
      "Content-Type": "text/plain;charset=UTF-8",
      Origin: "http://127.0.0.1:3100",
    },
    data: JSON.stringify(["products", { name: "Unauthorized write" }]),
  });
  expect(await denied.text()).toContain(
    "Administrator authentication and configured Supabase are required.",
  );
});
test("local admin edits persist across locales without publishing", async ({
  page,
}, info) => {
  await page.goto("/en/admin");
  await expect(
    page.getByText("Supabase is not connected.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Everyday Pour-Over Set", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("name", { exact: true })
    .fill("Local Demo Find");
  await dialog.getByRole("button", { name: "Save local demo" }).click();
  await expect(
    page.getByRole("table").getByText("Local Demo Find", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("table").getByText("Local Demo Find", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "中文", exact: true }).click();
  await expect(page.locator("h1")).toContainText("管理");
  await page.screenshot({
    path: `test-results/admin-zh-${info.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/en/deals/everyday-pour-over-set");
  await expect(page.locator("h1")).toHaveText("Everyday Pour-Over Set");
});
test("WCAG AA automated checks for both languages", async ({ page }) => {
  test.setTimeout(180000);
  for (const p of [
    "/en",
    "/zh",
    "/zh/deals",
    "/zh/deals/studio-wireless-headphones",
    "/zh/saved",
    "/zh/admin",
  ]) {
    await page.goto(p);
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
      p,
    ).toEqual([]);
  }
});
