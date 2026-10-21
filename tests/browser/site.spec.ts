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
test("complete home, original assets, and responsive screenshots", async ({
  page,
}, info) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Family-friendly finds for real life.",
  );
  await expect(page.locator(".category-tile")).toHaveCount(8);
  await expect(page.locator(".product-card")).toHaveCount(8);
  await expect(
    page.getByText("You’re browsing demo concepts.", { exact: false }),
  ).toBeVisible();
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0);
  await expect(page.locator(".product-price")).toHaveCount(0);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    expect(
      await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
  }
  await noOverflow(page);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/family-home-${info.project.name}.png`,
    fullPage: true,
  });
});
test("hero search and product details are functional", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search family finds", exact: true })
    .fill("headphones");
  await page
    .getByRole("button", { name: "Search family finds", exact: true })
    .click();
  await expect(page).toHaveURL(/search\?q=headphones/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("heading", { name: "Studio Wireless Headphones" })
    .getByRole("link")
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Studio Wireless Headphones",
  );
  await expect(
    page.getByText("No purchase link available.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Not checked — no live source", { exact: true }),
  ).toBeVisible();
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0);
});
test("category and retailer compose, share URLs, show empty state and reset", async ({
  page,
}) => {
  await page.goto("/deals");
  await expect(page.locator(".product-card")).toHaveCount(16);
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("baby");
  await page
    .getByRole("combobox", { name: "Retailer", exact: true })
    .selectOption("walmart");
  await page
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/category=baby/);
  await expect(page).toHaveURL(/retailer=walmart/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card h3")).toHaveText(
    "Little Steps Stacking Cups",
  );
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("searchbox", { name: "Search finds", exact: true })
    .fill("zzzznotfound");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(
    page.getByRole("heading", { name: "No finds just yet." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Reset search" }).click();
  await expect(page.locator(".product-card")).toHaveCount(16);
  await expect(page.locator('option[value="price-asc"]')).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Sort by", exact: true })
    .selectOption("name");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.locator(".product-card h3").first()).toHaveText(
    "Cozy Pet Bed",
  );
});
test("saved finds persist across reload and compose with filters", async ({
  page,
}) => {
  await page.goto("/saved");
  await expect(
    page.getByRole("heading", { name: "Your favorites start here." }),
  ).toBeVisible();
  await page.goto("/deals");
  await page
    .getByRole("button", {
      name: "Save Studio Wireless Headphones",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Unsave Studio Wireless Headphones",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.goto("/saved");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/deals?saved=1&category=tech&retailer=amazon");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.goto("/saved");
  await page
    .getByRole("button", {
      name: "Unsave Studio Wireless Headphones",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your favorites start here." }),
  ).toBeVisible();
});
test("responsive menu, store collection and original guides work", async ({
  page,
}, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Stores", exact: true })
      .click();
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Stores", exact: true })
      .click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Your stores. One useful place.",
  );
  await page.locator(".store-card.walmart").getByRole("link").click();
  await expect(page.locator(".product-card")).toHaveCount(8);
  await expect(
    page.locator(".product-card .retailer-badge.walmart"),
  ).toHaveCount(8);
  await page.goto("/guides");
  await expect(page.locator(".guide-card")).toHaveCount(5);
  await page
    .getByRole("heading", { name: "A kitchen that works for your family." })
    .getByRole("link")
    .click();
  await expect(
    page.getByRole("heading", { name: "Start with your real routine" }),
  ).toBeVisible();
  await noOverflow(page);
  if ((page.viewportSize()?.width || 1440) <= 950) {
    await page
      .getByRole("link", { name: "Search all finds", exact: true })
      .click();
    await expect(page).toHaveURL("/search");
  } else {
    await page
      .getByRole("searchbox", { name: "Search deals", exact: true })
      .fill("headphones");
    await page
      .getByRole("button", { name: "Submit search", exact: true })
      .click();
    await expect(page.locator(".product-card")).toHaveCount(1);
  }
});
test("local admin editor persists but cannot change public data", async ({
  page,
}, info) => {
  await page.goto("/admin");
  await expect(
    page.getByText("Supabase is not connected.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Everyday Pour-Over Set", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("dialog")
    .getByLabel("name", { exact: true })
    .fill("Local Demo Kitchen Find");
  await page
    .getByRole("dialog")
    .getByRole("combobox", { name: "status", exact: true })
    .selectOption("pending_review");
  await page
    .getByRole("button", { name: "Save local demo", exact: true })
    .click();
  await expect(
    page
      .getByRole("table")
      .getByText("Local Demo Kitchen Find", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page
      .getByRole("table")
      .getByText("Local Demo Kitchen Find", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Archive Local Demo Kitchen Find",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "Local Demo Kitchen Find" }),
  ).toContainText("archived");
  await page.getByRole("button", { name: "Categories", exact: false }).click();
  await page
    .getByRole("button", { name: "Create record", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("name", { exact: true }).fill("Local Test Category");
  await dialog.getByLabel("slug", { exact: true }).fill("local-test-category");
  await dialog
    .getByLabel("description", { exact: true })
    .fill("A local-only test record.");
  await dialog.getByRole("button", { name: "Save local demo" }).click();
  await expect(
    page.getByRole("table").getByText("Local Test Category", { exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  await page.screenshot({
    path: `test-results/family-admin-${info.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/deals/everyday-pour-over-set");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Everyday Pour-Over Set",
  );
});
test("required routes, metadata, index protection and true 404s", async ({
  page,
  request,
}) => {
  const paths = [
    "/",
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
  ];
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://oofcourse.com${path === "/" ? "" : path}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await noOverflow(page);
  }
  for (const path of [
    "/deals/missing",
    "/category/missing",
    "/stores/missing",
    "/guides/missing",
  ])
    expect((await request.get(path)).status()).toBe(404);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("/deals/");
  expect(sitemap).toContain("/guides/kitchen-essentials");
  // Exercise the actual server action, not an ordinary page POST (which Next
  // may render normally). Action IDs are public client references, not secrets.
  const manifest = JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8"),
  );
  const action = Object.entries(manifest.node).find(
    ([, v]) =>
      (v as { exportedName: string }).exportedName === "saveAdminRecord",
  )?.[0];
  expect(action).toBeTruthy();
  const denied = await request.post("/admin", {
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
test("malformed saved data recovers with an empty state", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("oofcourse:saved:v1", "broken-json"),
  );
  await page.goto("/saved");
  await expect(
    page.getByRole("heading", { name: "Your favorites start here." }),
  ).toBeVisible();
});
test("WCAG AA automated checks on home, catalog, detail, saved and admin", async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const path of [
    "/",
    "/deals",
    "/deals/studio-wireless-headphones",
    "/saved",
    "/admin",
  ]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
      path,
    ).toEqual([]);
  }
});
