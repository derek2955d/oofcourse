import { test } from "node:test";
import assert from "node:assert/strict";
import type { Listing } from "../lib/catalog";
import {
  salaryRange,
  publishedDate,
  supportsPriceFilters,
} from "../lib/browse-presentation";

test("job pay uses validated salary facts and never coerces absent values into zero", () => {
  for (const details of [
    {},
    { salary_min: null, salary_max: null },
    { salary_min: "", salary_max: "" },
    { salary_min: 50, salary_max: 20, pay_period: "hour" },
    { salary_min: 20, salary_max: 30, pay_period: "unknown" },
  ] as Listing["details"][])
    assert.equal(salaryRange(details), null);
  assert.deepEqual(
    salaryRange({ salary_min: 20, salary_max: 30, pay_period: "hour" }),
    { low: 20, high: 30, period: "hour" },
  );
  assert.equal(supportsPriceFilters(), false);
  assert.equal(supportsPriceFilters("jobs"), false);
  assert.equal(supportsPriceFilters("community"), false);
  assert.equal(supportsPriceFilters("marketplace"), true);
});
test("publication date does not substitute draft creation or invalid timestamps", () => {
  assert.equal(
    publishedDate({ published_at: null, created_at: "2026-10-01T12:00:00Z" }),
    null,
  );
  assert.equal(
    publishedDate({ published_at: "bad", created_at: "2026-10-01T12:00:00Z" }),
    null,
  );
  assert.equal(
    publishedDate({
      published_at: "2026-10-26T12:00:00Z",
      created_at: "2026-10-01T12:00:00Z",
    })?.toISOString(),
    "2026-10-26T12:00:00.000Z",
  );
});
