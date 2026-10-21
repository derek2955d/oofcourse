import { test, expect } from "@playwright/test";
test("home is complete, responsive, and has no purchasing links", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Your next favorite.",
  );
  await expect(page.locator(".product-card")).toHaveCount(12);
  await expect(page.getByText("No live offers or purchases.")).toBeVisible();
  await expect(page.locator('a[rel~="sponsored"]')).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const image of await page.locator(".product-image img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveJSProperty("complete", true);
    expect(
      await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/home-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("header search submits actual query and detail navigation works", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search deals" })
    .fill("headphones");
  await page.getByRole("button", { name: "Submit search" }).click();
  await expect(page).toHaveURL(/search\?q=headphones/);
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page
    .getByRole("heading", { name: "Studio Wireless Headphones" })
    .getByRole("link")
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Studio Wireless Headphones",
  );
  await expect(page.getByText("No purchase link available.")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});
test("category, sort, empty results and reset work", async ({ page }) => {
  await page.goto("/deals");
  await page
    .getByRole("combobox", { name: "Category", exact: true })
    .selectOption("tech");
  await page
    .getByRole("combobox", { name: "Sort by", exact: true })
    .selectOption("price-asc");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(4);
  await expect(page.locator(".product-card h3").first()).toHaveText(
    "Pocket Bluetooth Speaker",
  );
  await page.getByLabel("Search finds").fill("zzzznotfound");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No finds just yet." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page.locator(".product-card")).toHaveCount(12);
  await page.goto("/category/wellness");
  await expect(page.locator(".product-card")).toHaveCount(2);
});
test("mobile menu and navigation are accessible", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Home & Kitchen" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Home & Kitchen",
    );
  } else {
    await page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Home & Kitchen" })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Home & Kitchen",
    );
  }
});
test("required pages, missing routes, metadata and sitemap", async ({
  page,
  request,
}) => {
  for (const path of [
    "/",
    "/deals",
    "/category/tech",
    "/deals/studio-wireless-headphones",
    "/search",
    "/about",
    "/contact",
    "/privacy",
    "/affiliate-disclosure",
    "/admin",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://oofcourse.com${path === "/" ? "" : path}`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  for (const path of ["/deals/does-not-exist", "/category/does-not-exist"])
    expect((await request.get(path)).status()).toBe(404);
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).not.toContain("/deals/");
  expect((await request.get("/opengraph-image")).status()).toBe(200);
  expect(
    (await request.post("/admin", { data: { name: "unauthorized" } })).status(),
  ).toBe(405);
});
