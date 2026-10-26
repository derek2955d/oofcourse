import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("secondary search, category selection and language switching retain query state", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator(".category-card")).toHaveCount(6);
  await expect(page.locator(".listing-card")).toHaveCount(0);
  await expect(page.locator(".empty-state")).toHaveCount(0);
  await page.locator(".home-side-search > summary").click();
  await page
    .getByRole("searchbox", { name: "Keyword", exact: true })
    .fill("公寓");
  if (page.viewportSize()!.width > 760)
    await page
      .getByRole("combobox", { name: "Category", exact: true })
      .selectOption("housing");
  await page.getByRole("button", { name: "Find it locally" }).click();
  await expect(page).toHaveURL(/q=/);
  await page.locator(".language-switch").getByRole("button").click();
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "中文", exact: true })
    .click();
  await expect(page).toHaveURL(/\/zh\//);
  await expect(
    page.getByRole("searchbox", { name: "关键词", exact: true }).first(),
  ).toHaveValue("公寓");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});
test("category-specific filters submit real URL state and empty results remain honest", async ({
  page,
}) => {
  await page.goto("/en/housing");
  const mobile = page.viewportSize()!.width <= 760;
  if (mobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  const form = mobile
    ? page.getByRole("dialog").locator("form")
    : page.locator(".desktop-filter form");
  await form.getByLabel("Bedrooms", { exact: true }).fill("2");
  await form
    .getByRole("combobox", { name: "Rent or buy", exact: true })
    .selectOption("rent");
  await form
    .getByRole("combobox", { name: "Location", exact: true })
    .selectOption("queens");
  await form.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/bedrooms=2/);
  await expect(page).toHaveURL(/location=queens/);
  await expect(
    page.getByRole("heading", { name: "Nothing matched this time." }),
  ).toBeVisible();
  await page
    .locator(".empty-state")
    .getByRole("link", { name: "Clear filters" })
    .click();
  await expect(page).toHaveURL("/en/housing?state=NY");
  await page.goto("/en/jobs");
  expect(await page.locator('select[name="workplace"]').count()).toBe(2);
  expect(await page.locator('select[name="condition"]').count()).toBe(0);
  await page.goto("/en/marketplace");
  expect(await page.locator('select[name="condition"]').count()).toBe(2);
});
test("four-step publishing validates, preserves browser progress and never simulates submission", async ({
  page,
}) => {
  await page.goto("/en/post?category=marketplace");
  await expect(
    page.getByText("A connection is still needed.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Please check",
  );
  await page
    .getByRole("textbox", { name: /^Title \*/ })
    .fill("Private browser test fixture");
  await page.getByLabel("Price in USD *", { exact: true }).fill("10");
  await page
    .getByLabel("Pickup arrangements *", { exact: true })
    .fill("Public place");
  await page
    .getByRole("textbox", { name: /^Description \*/ })
    .fill(
      "This is an isolated browser test of private form progress. It must never appear in the public catalog.",
    );
  await page.reload();
  await page.getByRole("button", { name: "Restore browser progress" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByRole("textbox", { name: /^Title \*/ })).toHaveValue(
    "Private browser test fixture",
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Choose photos", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Submit for review", exact: true }),
  ).toBeDisabled();
  await page.goto("/en/marketplace");
  await expect(page.locator(".listing-card")).toHaveCount(0);
});
test("authentication, account and admin fail closed without external configuration", async ({
  page,
  request,
}) => {
  for (const route of [
    "/en/login",
    "/zh/signup",
    "/en/reset-password",
    "/zh/account",
    "/en/account/messages",
    "/zh/admin/users",
  ]) {
    expect((await page.goto(route))?.status()).toBe(200);
    await expect(page.locator(".connection-notice")).toBeVisible();
  }
  await page.goto("/en/login");
  await expect(
    page.getByRole("button", { name: "Log in", exact: true }),
  ).toBeDisabled();
  const manifest = JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8"),
  );
  for (const actionName of ["moderateMany", "saveListing"]) {
    const action = Object.entries(manifest.node).find(
      ([, v]) => (v as { exportedName: string }).exportedName === actionName,
    )?.[0];
    expect(action).toBeTruthy();
    const r = await request.post(
      actionName === "moderateMany" ? "/en/admin" : "/en/post",
      {
        headers: {
          "Next-Action": action!,
          "Content-Type": "text/plain;charset=UTF-8",
          Origin: "http://127.0.0.1:3100",
        },
        data: JSON.stringify([{}]),
      },
    );
    const body = await r.text();
    expect(body).toContain(
      actionName === "moderateMany" ? "adminOnly" : "setupMessage",
    );
  }
  expect((await request.get("/api/cron/expire")).status()).toBe(503);
});
test("detail previews are isolated, noindex, shareable and not real listings", async ({
  page,
  request,
}) => {
  await page.goto("/en/preview/housing");
  await expect(
    page.getByText("LAYOUT PREVIEW · NOT A REAL LISTING", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save listing", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Contact publisher", exact: true }),
  ).toBeDisabled();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await page.locator(".language-switch").getByRole("button").click();
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "中文", exact: true })
    .click();
  await expect(page).toHaveURL("/zh/preview/housing");
  for (const route of [
    "/en/housing/00000000-0000-0000-0000-000000000000",
    "/zh/jobs/missing",
    "/en/not-a-category",
    "/zh/account/unknown",
  ]) {
    const response = await request.get(route);
    // Next.js preserves 200 after streaming starts; the fallback and noindex
    // still must be present, so unavailable records never become real details.
    expect([200, 404]).toContain(response.status());
    const html = await response.text();
    expect(html).toContain("NEXT_HTTP_ERROR_FALLBACK;404");
    expect(html).toContain('name="robots" content="noindex"');
  }
});
test("bilingual routes and search metadata, hreflang, robots and sitemap are correct", async ({
  request,
}) => {
  test.setTimeout(180000);
  for (const l of ["en", "zh"])
    for (const path of [
      "",
      "/housing",
      "/jobs",
      "/marketplace",
      "/services",
      "/businesses",
      "/community",
      "/categories",
      "/search",
      "/about",
      "/contact",
      "/help",
      "/terms",
      "/privacy",
      "/safety",
      "/guidelines",
      "/login",
      "/signup",
      "/post",
      "/account",
      "/admin",
    ]) {
      const r = await request.get(`/${l}${path}`);
      expect(r.status(), `/${l}${path}`).toBe(200);
      const html = await r.text();
      expect(html).toContain(`href="https://oofcourse.com/${l}${path}"`);
      expect(html).toContain('hrefLang="en-US"');
      expect(html).toContain('hrefLang="zh-CN"');
      expect(html).toContain('name="description"');
      expect(html).toContain("noindex");
    }
  const root = await request.get("/", { maxRedirects: 0 });
  expect(root.status()).toBeGreaterThanOrEqual(300);
  expect(root.headers().location).toContain("/en");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/zh/community");
  expect(sitemap).not.toContain("/preview/");
  expect(sitemap).not.toContain("/account");
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /",
  );
});

test("New York living guides, official calendars and bilingual article routes work without invented events", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const { livingGuides } = await import("../../lib/living");
  const { activeEditorialActivities } =
    await import("../../lib/editorial-activities");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}`);
    const section = page.locator(".activity-home-main");
    await expect(page.locator("main .living-guide-card")).toHaveCount(0);
    await expect(
      page.locator(".activity-home-aside .category-card"),
    ).toHaveCount(6);
    await expect(section.locator(".living-upcoming article")).toHaveCount(0);
    await expect(section.locator(".editorial-activity-card")).toHaveCount(
      activeEditorialActivities().length,
    );
    if (!activeEditorialActivities().length)
      await expect(section.locator(".living-event-empty")).toBeVisible();
    const sources = section.locator(".living-calendar-grid > a");
    await expect(sources).toHaveCount(4);
    for (const link of await sources.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      expect(new URL((await link.getAttribute("href"))!).protocol).toBe(
        "https:",
      );
    }
    await page.locator(".home-living-index").click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/living$`));
    await page
      .locator("main .living-guide-card")
      .first()
      .getByRole("link")
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/living/rental-viewing-checklist`),
    );
    for (const guide of livingGuides) {
      await page.goto(`/${locale}/living/${guide.slug}`);
      await expect(page.locator("main h1")).toHaveText(guide.title[locale]);
      await expect(page.locator(".living-article > section")).toHaveCount(3);
      await expect(page.locator(".living-article-sources a")).toHaveCount(
        guide.sources.length,
      );
      await expect(page.locator(".living-article-action a")).toHaveAttribute(
        "href",
        `/${locale}/${guide.topic}?state=NY`,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const response = await request.get(`/${locale}/living/${guide.slug}`);
      const html = await response.text();
      expect(response.status()).toBe(200);
      expect(html).toContain(
        `https://oofcourse.com/${locale}/living/${guide.slug}`,
      );
      expect(html).toContain('hrefLang="en-US"');
      expect(html).toContain('hrefLang="zh-CN"');
      expect(html).not.toContain('"@type":"Event"');
    }
    const target = locale === "en" ? "中文" : "English";
    const other = locale === "en" ? "zh" : "en";
    await page.locator(".language-switch").getByRole("button").click();
    await page
      .locator(".language-switch")
      .getByRole("link", { name: target, exact: true })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/${other}/living/libraries-and-local-activities`),
    );
    await page.goto(`/${locale}/living`);
    await expect(page.locator("main h1")).toHaveCount(1);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/living-${locale}-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
    await page.goto(`/${locale}/living/rental-viewing-checklist`);
    const articleScan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      articleScan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const guide of livingGuides)
    expect(sitemap).toContain(`/zh/living/${guide.slug}`);
  const missing = await request.get("/en/living/not-a-real-guide");
  const body = await missing.text();
  expect([200, 404]).toContain(missing.status());
  expect(body).toContain("noindex");
  expect(body).not.toContain('class="living-article"');
});

test("published editorial activity has truthful details, working source links and bilingual navigation", async ({
  page,
  request,
}) => {
  const { activeEditorialActivities, editorialActivities } =
    await import("../../lib/editorial-activities");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const activity = editorialActivities[0];
  for (const locale of ["zh", "en"] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator(".editorial-activity-card")).toHaveCount(
      activeEditorialActivities().length,
    );
    if (activeEditorialActivities().length)
      await page.locator(".editorial-activity-card h3 a").click();
    else await page.goto(`/${locale}/activities/${activity.slug}`);
    await expect(page).toHaveURL(
      new RegExp(`/${locale}/activities/${activity.slug}`),
    );
    await expect(page.locator("main h1")).toHaveText(activity.title[locale]);
    await expect(
      page.locator(".editorial-activity-facts time"),
    ).toHaveAttribute("datetime", activity.startsAt);
    await expect(page.locator(".editorial-activity-detail")).toContainText(
      activity.fees[locale],
    );
    await expect(page.locator(".editorial-activity-detail")).toContainText(
      activity.seasonNote[locale],
    );
    const official = page.locator(".living-article-action a[target='_blank']");
    await expect(official).toHaveAttribute("href", activity.sourceUrl);
    await expect(official).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator(".editorial-activity-detail img")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const scan = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      scan.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/editorial-${locale}-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
    await page.locator(".language-switch").getByRole("button").click();
    await page
      .locator(".language-switch")
      .getByRole("link", {
        name: locale === "zh" ? "English" : "中文",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(
      new RegExp(
        `/${locale === "zh" ? "en" : "zh"}/activities/${activity.slug}`,
      ),
    );
  }
  const html = await (
    await request.get(`/zh/activities/${activity.slug}`)
  ).text();
  expect(html).toContain(
    `https://oofcourse.com/zh/activities/${activity.slug}`,
  );
  expect(html).toContain('hrefLang="en-US"');
  expect(html).not.toContain('"@type":"Event"');
  const missing = await (
    await request.get("/en/activities/not-an-activity")
  ).text();
  expect(missing).toContain("noindex");
  expect(missing).not.toContain("editorial-activity-detail");
});

test("community browse includes editorial activities and official calendars without replacing filters", async ({
  page,
}) => {
  for (const locale of ["zh", "en"]) {
    for (const suffix of ["", "?subcategory=events"]) {
      await page.goto(`/${locale}/community${suffix}`);
      await expect(page.locator(".community-activities")).toBeVisible();
      await expect(page.locator(".living-calendar-grid a")).toHaveCount(4);
      const { activeEditorialActivities } =
        await import("../../lib/editorial-activities");
      await expect(
        page.locator(".community-activities .editorial-activity-card"),
      ).toHaveCount(activeEditorialActivities().length);
      await expect(
        page.locator(".living-calendar-grid a").first(),
      ).toHaveAttribute("rel", "noopener noreferrer");
      await expect(page.locator('main input[name="q"]').first()).toBeAttached();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto(`/${locale}/community?subcategory=volunteering`);
    await expect(page.locator(".community-activities")).toHaveCount(0);
    await page.goto(`/${locale}/community?q=library`);
    await expect(page.locator(".community-activities")).toHaveCount(0);
  }
});
