import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("secondary search, category selection and language switching retain query state", async ({
  page,
}) => {
  await page.goto("/en");
  await expect(page.locator(".category-card")).toHaveCount(5);
  await expect(
    page.locator('.desktop-categories a[href*="/community"]'),
  ).toHaveCount(0);
  await expect(page.locator('.category-card[href*="/community"]')).toHaveCount(
    0,
  );
  if (page.viewportSize()!.width < 761) {
    await page.locator(".menu-button").click();
    await expect(
      page.locator('#mobile-menu a[href*="/community"]'),
    ).toHaveCount(0);
    await page.locator(".menu-button").click();
  }
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
    page.locator('[data-catalog-state="unconfigured"]'),
  ).toBeVisible();
  await expect(page.locator(".empty-state")).toHaveCount(0);
  if (mobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  await form.locator(".filter-buttons a").click();
  await expect(page).toHaveURL("/en/housing?state=NY");
  await page.goto(
    "/en/jobs?subcategory=tech&industry=IT&workplace=remote&pay_period=hour",
  );
  await expect(
    page.locator(
      'main [name="subcategory"], main [name="industry"], main [name="workplace"], main [name="pay_period"]',
    ),
  ).toHaveCount(0);
  await expect(page.locator(".active-filters")).toHaveCount(0);
  const jobForm = mobile
    ? page.locator(".filter-drawer form")
    : page.locator(".desktop-filter form");
  await expect(jobForm.locator('select[name="employment"] option')).toHaveText([
    "Any",
    "Full-time",
    "Part-time",
  ]);
  if (mobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  await jobForm.locator('select[name="employment"]').selectOption("full-time");
  await jobForm.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/employment=full-time/);
  await expect(page.locator(".active-filters")).toContainText("Full-time");
  expect(await page.locator('select[name="condition"]').count()).toBe(0);
  await page.goto("/en/marketplace?condition=new&free=1");
  expect(await page.locator('select[name="condition"]').count()).toBe(0);
  await expect(
    page.locator('input[name="free"], input[name="condition"]'),
  ).toHaveCount(0);
  await expect(page.locator(".active-filters")).toHaveCount(0);
  await expect(page.locator('input[name="min"]')).toHaveCount(2);
  await expect(page.locator('input[name="max"]')).toHaveCount(2);
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
    "/zh/account/security?recoveryVerified=true&verified=1",
    "/en/account/listings?status=expired&page=2&user_id=someone-else",
    "/zh/account/drafts?page=999999",
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
  for (const actionName of ["moderateMany", "saveListing", "changePassword"]) {
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
      actionName === "moderateMany"
        ? "adminOnly"
        : actionName === "changePassword"
          ? "validation"
          : "setupMessage",
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

test("New York living guides and bilingual article routes work without calendar directories or invented events", async ({
  page,
  request,
}) => {
  test.setTimeout(180000);
  const { livingGuides } = await import("../../lib/living");
  const { homepageEditorialActivities } =
    await import("../../lib/editorial-activities");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const locale of ["en", "zh"] as const) {
    await page.goto(`/${locale}`);
    const section = page.locator(".activity-home-main");
    await expect(page.locator("main .living-guide-card")).toHaveCount(0);
    await expect(
      page.locator(".activity-home-aside .category-card"),
    ).toHaveCount(5);
    await expect(section.locator(".living-upcoming article")).toHaveCount(0);
    await expect(section.locator(".editorial-activity-card")).toHaveCount(
      Math.min(3, homepageEditorialActivities().length),
    );
    if (!homepageEditorialActivities().length)
      await expect(section.locator(".living-event-empty")).toBeVisible();
    await expect(page.locator(".living-official")).toHaveCount(0);
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
  const { homepageEditorialActivities, editorialActivities } =
    await import("../../lib/editorial-activities");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const activity = editorialActivities[0];
  for (const locale of ["zh", "en"] as const) {
    await page.goto(`/${locale}`);
    await expect(page.locator(".editorial-activity-card")).toHaveCount(
      Math.min(3, homepageEditorialActivities().length),
    );
    if (
      homepageEditorialActivities().some((item) => item.slug === activity.slug)
    )
      await page
        .locator(`.editorial-activity-card h3 a[href$="/${activity.slug}"]`)
        .click();
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

test("community hub combines activities and posts without calendar directories or area filters", async ({
  page,
}) => {
  for (const locale of ["zh", "en"]) {
    for (const suffix of ["", "?subcategory=events"]) {
      await page.goto(`/${locale}/community${suffix}`);
      await expect(page.locator(".community-activities")).toBeVisible();
      await expect(page.locator(".living-official")).toHaveCount(0);
      const { recentEditorialActivities } =
        await import("../../lib/editorial-activities");
      await expect(
        page.locator(".community-activities .editorial-activity-card"),
      ).toHaveCount(recentEditorialActivities().length);
      await expect(page.locator('main input[name="q"]').first()).toBeAttached();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto(`/${locale}/community?subcategory=volunteering`);
    await expect(page.locator(".community-activities")).toBeVisible();
    await expect(page.locator(".active-filters")).toHaveCount(0);
    await expect(page.locator('main input[name="subcategory"]')).toHaveCount(0);
    await page.goto(`/${locale}/community?location=queens`);
    await expect(page.locator('main select[name="location"]')).toHaveCount(0);
    await expect(page.locator(".browse-areas")).toHaveCount(0);
    await expect(
      page.locator(".desktop-filter, .mobile-filter-trigger"),
    ).toHaveCount(0);
    await expect(page.locator('main input[name="location"]')).toHaveCount(0);
    await expect(page.locator(".active-filters")).toHaveCount(0);
    await page.goto(`/${locale}/community?q=library`);
    await expect(page.locator(".community-activities")).toBeVisible();
  }
});

test("password-change fields require old-password verification and confirmation in both languages", async ({
  page,
}) => {
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { PasswordFields } = await import("../../components/password-fields");
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  for (const locale of ["zh", "en"]) {
    await page.goto(`/${locale}/login?passwordChanged=1`);
    await expect(page.locator('.notice[role="status"]')).toContainText(
      locale === "zh" ? "新密码" : "new password",
    );
    const styles = await page
      .locator('link[rel="stylesheet"]')
      .evaluateAll((links) => links.map((link) => link.outerHTML).join(""));
    const labels =
      locale === "zh"
        ? {
            current: "当前密码",
            next: "新密码",
            confirm: "再次输入新密码",
            hint: "隔离表单测试，不代表已登录账号。",
          }
        : {
            current: "Current password",
            next: "New password",
            confirm: "Confirm new password",
            hint: "Isolated form test, not an authenticated account.",
          };
    for (const requireCurrent of [true, false]) {
      const fields = renderToStaticMarkup(
        createElement(PasswordFields, { requireCurrent, labels }),
      );
      await page.setContent(
        `<!doctype html><html lang="${locale === "zh" ? "zh-CN" : "en-US"}"><head><title>Isolated security fields</title>${styles}</head><body><main class="container page"><h1>Security form fields</h1><form class="surface stack">${fields}<button type="submit">Check fields</button></form></main></body></html>`,
      );
      await expect(page.locator('input[name="current_password"]')).toHaveCount(
        requireCurrent ? 1 : 0,
      );
      await expect(
        page.getByLabel(labels.next, { exact: true }),
      ).toHaveAttribute("autocomplete", "new-password");
      expect(
        await page
          .locator("form")
          .evaluate((form) => (form as HTMLFormElement).checkValidity()),
      ).toBe(false);
      if (requireCurrent)
        await page
          .getByLabel(labels.current, { exact: true })
          .fill("test-old-password");
      await page
        .getByLabel(labels.next, { exact: true })
        .fill("test-new-password");
      expect(
        await page
          .locator("form")
          .evaluate((form) => (form as HTMLFormElement).checkValidity()),
      ).toBe(false);
      await page
        .getByLabel(labels.confirm, { exact: true })
        .fill("test-new-password");
      expect(
        await page
          .locator("form")
          .evaluate((form) => (form as HTMLFormElement).checkValidity()),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const accessibility = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(accessibility.violations.map((value) => value.id)).toEqual([]);
    }
  }
});

test("weekend navigation, filters, details and bilingual SEO work on desktop and mobile", async ({
  page,
  request,
}) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  const mobile = page.viewportSize()!.width < 761;
  for (const locale of ["zh", "en"]) {
    await page.goto(`/${locale}`);
    const label = locale === "zh" ? "周边活动" : "Nearby events";
    if (mobile) {
      await page.locator(".menu-button").click();
      await page
        .locator("#mobile-menu")
        .getByRole("link", { name: label, exact: true })
        .click();
    } else
      await page
        .locator(".desktop-categories")
        .getByRole("link", { name: label, exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/weekend$`));
    await expect(page.locator(".weekend-card")).toHaveCount(6);
    await expect(page.locator(".living-events")).toBeVisible();
    await page.locator(".weekend-destinations > summary").click();
    await page.locator('select[name="area"]').selectOption("nj");
    await page.locator('select[name="type"]').selectOption("art");
    await page.locator(".weekend-filters button").click();
    await expect(page.locator(".weekend-card")).toHaveCount(0);
    await page.locator('select[name="area"]').selectOption("hudson");
    await page.locator(".weekend-filters button").click();
    await expect(page.locator(".weekend-card")).toHaveCount(1);
    await page.locator(".language-switch button").click();
    await page
      .locator(".language-options")
      .getByRole("link", {
        name: locale === "zh" ? "English" : "中文",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/area=hudson/);
    await expect(page).toHaveURL(/type=art/);
    await page.locator(".weekend-card a").click();
    await expect(page).toHaveURL(/weekend\/dia-beacon$/);
    await expect(page.locator(".weekend-detail section")).toHaveCount(3);
    await expect(page.locator(".weekend-actions a")).toHaveCount(2);
    for (const link of await page.locator(".weekend-actions a").all()) {
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      await expect(link).toHaveAttribute("target", "_blank");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations.map((v) => v.id),
    ).toEqual([]);
  }
  for (const locale of ["zh", "en"]) {
    await page.goto(`/${locale}/weekend`);
    if (!mobile) {
      await page.setViewportSize({ width: 1100, height: 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.setViewportSize({ width: 1440, height: 1000 });
    }
    await page.evaluate(() => document.fonts.ready.then(() => true));
    await page.screenshot({
      path: `test-results/weekend-${locale}-${page.viewportSize()!.width}.png`,
      fullPage: true,
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations.map((v) => v.id),
    ).toEqual([]);
  }
  const detail = await (await request.get("/zh/weekend/met-cloisters")).text();
  expect(detail).toContain("https://oofcourse.com/zh/weekend/met-cloisters");
  expect(detail).toContain('hrefLang="en-US"');
  expect(detail).not.toContain('"@type":"Event"');
  const missing = await (await request.get("/en/weekend/not-real")).text();
  expect(missing).toContain("noindex");
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/zh/weekend/dia-beacon",
  );
});

test("public outing submissions remain paused while the nearby-events prototype is reviewed", async ({
  page,
}) => {
  await page.goto("/zh/weekend");
  await expect(page.locator(".weekend-submit")).toHaveCount(0);
  await expect(page.locator(".weekend-destinations")).not.toHaveAttribute(
    "open",
    "",
  );
  await page.goto("/zh/post?category=community&subcategory=outings");
  await expect(page.locator(".notice")).toContainText("公开投稿暂未开放");
  await expect(page.locator("input[name='title']")).toHaveCount(0);
});

test("nearby editorial dates have no invented start hour and show multi-day ranges", async ({
  page,
}) => {
  for (const locale of ["zh", "en"]) {
    await page.goto(`/${locale}/activities/queens-film-arts-festival-2026`);
    const times = page.locator(".editorial-activity-facts time");
    await expect(times).toHaveCount(2);
    await expect(times.first()).toHaveAttribute("datetime", "2026-11-13");
    await expect(times.last()).toHaveAttribute("datetime", "2026-11-14");
    expect(await times.first().textContent()).not.toContain(":00");
    await expect(
      page.locator(".living-article-action a[target='_blank']"),
    ).toHaveAttribute(
      "href",
      "https://www.nyctourism.com/events/queens-world-film-arts-fest/",
    );
  }
});

test("website assistant denies anonymous generation and draft creation", async ({
  page,
  request,
}) => {
  for (const locale of ["en", "zh"]) {
    await page.goto(`/${locale}/admin/assistant`);
    await expect(page.locator(".connection-notice")).toBeVisible();
    await expect(page.locator("textarea")).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  }
  const manifest = JSON.parse(
    readFileSync(".next/server/server-reference-manifest.json", "utf8"),
  );
  for (const [name, expected] of [
    ["prepareActivity", "setupMessage"],
    ["storeActivityDraft", "save"],
  ]) {
    const action = Object.entries(manifest.node).find(
      ([, v]) => (v as { exportedName: string }).exportedName === name,
    )?.[0];
    expect(action).toBeTruthy();
    const result = await request.post("/en/admin/assistant", {
      headers: {
        "Next-Action": action!,
        "Content-Type": "text/plain;charset=UTF-8",
        Origin: "http://127.0.0.1:3100",
      },
      data: JSON.stringify([{}]),
    });
    expect(await result.text()).toContain(expected);
  }
});

test("real activity list combines all sourced entries without ended blocks", async ({
  page,
}) => {
  const { recentEditorialActivities, archivedEditorialActivities } =
    await import("../../lib/editorial-activities");
  for (const locale of ["en", "zh"]) {
    await page.goto(`/${locale}/preview/activity-year`);
    await expect(page).toHaveURL(new RegExp(`/${locale}/weekend$`));
    await expect(
      page.locator(".living-events .editorial-activity-card"),
    ).toHaveCount(recentEditorialActivities().length);
    await expect(page.locator("#recent-archive-heading")).toHaveCount(0);
    await expect(page.locator(".living-events details")).toHaveCount(0);
    const past = archivedEditorialActivities()[0];
    await page
      .locator(`.editorial-activity-body a[href$="/${past.slug}"]`)
      .last()
      .click();
    await expect(
      page.locator(".editorial-activity-detail .notice"),
    ).toHaveCount(0);
    await expect(page.locator(".editorial-activity-facts time")).toBeVisible();
    await expect(page.locator(".living-article-sources a")).toHaveAttribute(
      "href",
      /^https:\/\//,
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("activity-first polish keeps navigation direct and search singular", async ({
  page,
}) => {
  for (const locale of ["zh", "en"]) {
    await page.goto(`/${locale}`);
    await expect(page.locator(".desktop-categories a").first()).toHaveAttribute(
      "href",
      `/${locale}/weekend`,
    );
    await expect(page.locator(".mobile-header-tools")).toHaveCount(0);
    if (page.viewportSize()!.width < 761) {
      expect(
        (await page.locator(".site-header").boundingBox())!.height,
      ).toBeLessThanOrEqual(80);
      await page.locator('.mobile-bottom a[href$="/weekend"]').click();
    } else await page.locator(".desktop-categories a").first().click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/weekend$`));
    await expect(
      page.locator('.living-section-heading a[href$="/weekend"]'),
    ).toHaveCount(0);
    await expect(
      page.locator(".editorial-activity-card h3").first(),
    ).not.toContainText(" · ");
    await page.goto(`/${locale}/housing?q=studio&sort=price-low`);
    await expect(
      page.locator('main input[type="search"][name="q"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('.desktop-filter input[name="q"]'),
    ).toHaveAttribute("type", "hidden");
    await expect(
      page.locator('main input[type="search"][name="q"]'),
    ).toHaveAttribute(
      "placeholder",
      locale === "zh"
        ? "搜索房源、街区或房型…"
        : "Search homes, neighborhoods or property types…",
    );
    if (page.viewportSize()!.width < 761)
      await page
        .getByRole("button", {
          name: locale === "zh" ? "筛选" : "Filters",
          exact: true,
        })
        .click();
    const form =
      page.viewportSize()!.width < 761
        ? page.getByRole("dialog").locator("form")
        : page.locator(".desktop-filter form");
    await form.locator('select[name="location"]').selectOption("queens");
    await form
      .getByRole("button", {
        name: locale === "zh" ? "应用筛选" : "Apply filters",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(/q=studio/);
    await expect(page).toHaveURL(/location=queens/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("unconfigured catalogs offer honest retry and activity labels stay general", async ({
  page,
}) => {
  for (const locale of ["en", "zh"]) {
    await page.goto(
      `/${locale}/housing?state=NY&q=studio&location=queens&sort=price-low`,
    );
    await expect(
      page.locator('[data-catalog-state="unconfigured"]'),
    ).toBeVisible();
    await expect(page.locator(".empty-state")).toHaveCount(0);
    await expect(page.locator(".results-toolbar")).not.toContainText(
      locale === "zh" ? "0 条信息" : "0 listings",
    );
    const current = page.url();
    await Promise.all([
      page.waitForEvent("load"),
      page.locator(".catalog-service-state button").click(),
    ]);
    await expect(
      page.locator('[data-catalog-state="unconfigured"]'),
    ).toBeVisible();
    expect(page.url()).toBe(current);
    await page.goto(`/${locale}/activities/new-york-city-marathon-2026`);
    await expect(
      page.locator(".editorial-activity-facts dt").first(),
    ).toHaveText(locale === "zh" ? "活动时间" : "Event dates and times");
    await page.goto(`/${locale}/help`);
    await expect(page.locator("main")).not.toContainText(
      locale === "zh" ? "六大分类" : "six categories",
    );
  }
});
