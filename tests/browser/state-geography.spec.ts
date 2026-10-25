import { test, expect } from "@playwright/test";
test("global state selection scopes category areas and survives navigation and reload", async ({
  page,
  context,
}) => {
  await page.goto("/en");
  await expect(page.locator("main h1")).toBeVisible();
  const state = page
    .locator(".site-header")
    .getByRole("combobox", { name: "State", exact: true });
  await expect(state.locator("option")).toHaveCount(51);
  await expect(state.locator('option[value="queens"]')).toHaveCount(0);
  await expect(state.locator('option[value="NY"]')).toHaveText("New York");
  await state.selectOption("CA");
  await expect(page).toHaveURL(/state=CA/);
  await expect(
    page.locator('main .hero-search select[name="state"]'),
  ).toHaveValue("CA");
  await page.locator('.category-card[href*="/housing"]').click();
  await expect(page).toHaveURL(/\/en\/housing\?state=CA/);
  await expect(page.locator(".catalog-header .eyebrow")).toHaveText(
    "California",
  );
  const mobile = page.viewportSize()!.width < 761;
  async function filter() {
    if (mobile)
      await page.getByRole("button", { name: "Filters", exact: true }).click();
    return mobile
      ? page.getByRole("dialog").locator("form")
      : page.locator(".desktop-filter form");
  }
  let form = await filter();
  await expect(form.locator('select[name="location"] option')).toHaveCount(1);
  await expect(
    form.locator('select[name="location"] option[value="queens"]'),
  ).toHaveCount(0);
  if (mobile)
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Close", exact: true })
      .click();
  await expect
    .poll(
      async () =>
        (await context.cookies()).find((c) => c.name === "oofcourse_state")
          ?.value,
    )
    .toBe("CA");
  await page.goto("/en/jobs");
  await expect(page.locator(".catalog-header .eyebrow")).toHaveText(
    "California",
  );
  await expect(state).toHaveValue("CA");
  await state.selectOption("NY");
  await expect(page).toHaveURL(/state=NY/);
  form = await filter();
  await expect(
    form.locator('select[name="location"] option[value="queens"]'),
  ).toHaveText("Queens");
  await form
    .getByRole("combobox", { name: "Location", exact: true })
    .selectOption("queens");
  await form
    .getByRole("button", { name: "Apply filters", exact: true })
    .click();
  await expect(page).toHaveURL(/state=NY/);
  await expect(page).toHaveURL(/location=queens/);
  await state.selectOption("CA");
  await expect(page).toHaveURL(/state=CA/);
  expect(new URL(page.url()).searchParams.has("location")).toBe(false);
  await page.reload();
  await expect(state).toHaveValue("CA");
  await expect(page.locator(".catalog-header .eyebrow")).toHaveText(
    "California",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/state-category-${page.viewportSize()!.width}.png`,
  });
  await page.goto("/en/post?state=CA");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.locator("main .form-grid select:not([name])")).toHaveValue(
    "CA",
  );
  await expect(
    page.locator('main select[name="location"] option[value="nyc"]'),
  ).toHaveCount(0);
  await expect(page.locator('main select[name="location"]')).toHaveValue("");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("main .form-grid select:not([name])").selectOption("NY");
  await expect(page.locator('main select[name="location"]')).toHaveValue("");
  await page.locator('main select[name="location"]').selectOption("nyc");
  await expect(page.locator('main select[name="location"]')).toHaveValue("nyc");
});
