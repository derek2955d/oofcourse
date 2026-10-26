import { test, expect } from "@playwright/test";
test("NY and nearby NJ rollout hides unopened states and normalizes older state links and preferences", async ({
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
  await expect(state.locator("option")).toHaveCount(2);
  await expect(state.locator("option")).toHaveText(["New York", "New Jersey"]);
  await expect(
    page.locator(".site-header .location-compact:visible option"),
  ).toHaveCount(2);
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
  ).toHaveCount(2);
  await expect(page.locator("main .form-grid select:not([name])")).toHaveValue(
    "NY",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("local discovery preserves filters, removes individual chips and uses category-specific controls", async ({
  page,
}) => {
  await page.goto(
    "/zh/housing?state=NY&q=apartment&tenure=rent&sort=price-low&page=2",
  );
  const quick = page.getByRole("navigation", {
    name: "按地区浏览",
    exact: true,
  });
  await quick.getByRole("link", { name: "皇后区", exact: true }).click();
  await expect(page).toHaveURL(/location=queens/);
  expect(new URL(page.url()).searchParams.get("q")).toBe("apartment");
  expect(new URL(page.url()).searchParams.get("sort")).toBe("price-low");
  expect(new URL(page.url()).searchParams.has("page")).toBe(false);
  const chips = page.getByRole("navigation", { name: "已选条件", exact: true });
  await chips.getByRole("link", { name: /移除.*apartment/ }).click();
  await expect(page).toHaveURL((url) => !url.searchParams.has("q"));
  await expect(page).toHaveURL(/location=queens/);
  const mobile = page.viewportSize()!.width < 761;
  if (mobile)
    await page.getByRole("button", { name: "筛选", exact: true }).click();
  const filter = mobile
    ? page.getByRole("dialog").locator("form")
    : page.locator(".desktop-filter form");
  await expect(filter.locator('select[name="location"] option')).toHaveCount(
    11,
  );
  expect(
    await filter
      .locator('select[name="location"] option')
      .evaluateAll((options) =>
        options.map((o) => (o as HTMLOptionElement).value),
      ),
  ).toEqual([
    "",
    "manhattan",
    "brooklyn",
    "queens",
    "bronx",
    "staten-island",
    "jersey-city",
    "hoboken",
    "weehawken",
    "union-city",
    "west-new-york",
  ]);
  await expect(filter.locator('select[name="location"] optgroup')).toHaveCount(
    2,
  );
  await expect(
    filter.getByLabel("最低月租（美元）", { exact: true }),
  ).toBeVisible();
  await page.goto("/en/jobs?state=NY&min=99999&sort=price-low");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator(".sort-control select")).toHaveValue("newest");
  await expect(page.locator(".sort-control option")).toHaveCount(1);
  if (mobile)
    await page.getByRole("button", { name: "Filters", exact: true }).click();
  const jobs = mobile
    ? page.getByRole("dialog").locator("form")
    : page.locator(".desktop-filter form");
  await expect(
    jobs.locator('input[name="min"], input[name="max"]'),
  ).toHaveCount(0);
  await expect(jobs.locator('select[name="pay_period"]')).toHaveCount(0);
  await expect(jobs.locator('select[name="employment"]')).toBeVisible();
});

test("near-Manhattan NJ selection submits the correct state and survives language switching", async ({
  page,
}) => {
  await page.goto("/zh/housing?state=NY&q=apartment");
  const mobile = page.viewportSize()!.width < 761;
  if (mobile)
    await page.getByRole("button", { name: "筛选", exact: true }).click();
  const form = mobile
    ? page.getByRole("dialog").locator("form")
    : page.locator(".desktop-filter form");
  await form.locator('select[name="location"]').selectOption("jersey-city");
  await form.getByRole("button", { name: "应用筛选", exact: true }).click();
  await expect(page).toHaveURL(/state=NJ/);
  await expect(page).toHaveURL(/location=jersey-city/);
  await expect(page.locator(".catalog-header .eyebrow")).toHaveText("新泽西");
  await expect(page.locator(".active-filters")).toContainText("泽西市");
  await page.locator(".language-switch").getByRole("button").click();
  await page
    .locator(".language-switch")
    .getByRole("link", { name: "English", exact: true })
    .click();
  await expect(page).toHaveURL(/state=NJ/);
  await expect(page).toHaveURL(/location=jersey-city/);
  await expect(page.locator(".active-filters")).toContainText("Jersey City");
  await expect(page.locator(".footer-location")).toHaveText("New Jersey");
});
