import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  products,
  selectProducts,
  safeAffiliateUrl,
  displayPrice,
} from "../lib/data";
import { parseSaved } from "../lib/saved";
import { normalizeQuery } from "../lib/query";
import { shouldCollectAnalytics } from "../lib/analytics";
test("nine categories and sixteen provenance-labeled demo concepts, without invented commerce data", () => {
  assert.equal(categories.length, 9);
  assert.equal(products.length, 16);
  assert.equal(new Set(products.map((p) => p.slug)).size, 16);
  for (const p of products) {
    assert.ok(categories.some((c) => c.slug === p.category));
    assert.equal(p.isDemo, true);
    assert.equal(p.currentPrice, null);
    assert.equal(p.originalPrice, null);
    assert.equal(p.discountPercentage, null);
    assert.equal(p.lastCheckedAt, null);
    assert.equal(safeAffiliateUrl(p), null);
    assert.equal(displayPrice(p), null);
    assert.ok(p.imageLicense && p.sourceId);
  }
});
test("keyword, category, retailer and empty-state filters compose", () => {
  assert.equal(selectProducts({ q: " HEADPHONES " }).length, 1);
  assert.equal(selectProducts({ q: "headphones", category: "home" }).length, 0);
  assert.equal(selectProducts({ retailer: "amazon" }).length, 8);
  assert.equal(
    selectProducts({ category: "baby", retailer: "walmart" }).length,
    1,
  );
  assert.equal(selectProducts({ q: "zzzznotfound" }).length, 0);
});
test("authorized sorting is limited to date and name", () => {
  const result = selectProducts({ sort: "name" });
  assert.equal(result[0].name, "Cozy Pet Bed");
  const recent = selectProducts({ sort: "newest" });
  for (let i = 1; i < recent.length; i++)
    assert.ok(recent[i - 1].createdAt >= recent[i].createdAt);
  assert.equal(
    normalizeQuery({ sort: "savings", q: ["bad"], saved: "1" }).sort,
    "newest",
  );
});
test("affiliate gate rejects demo, stale, unsafe, and cross-retailer links", () => {
  const now = Date.parse("2026-10-21T12:00:00Z");
  const active = {
    ...products[0],
    isDemo: false,
    status: "published" as const,
    affiliateApproved: true,
    affiliateUrl: "https://www.amazon.com/example",
    lastCheckedAt: "2026-10-21T11:00:00Z",
    expiresAt: "2026-10-22T00:00:00Z",
  };
  assert.ok(safeAffiliateUrl(active, now));
  for (const affiliateUrl of [
    "javascript:alert(1)",
    "http://amazon.com/x",
    "https://amazon.com.evil.test/x",
    "https://user:pass@amazon.com/x",
    "https://www.walmart.com/x",
  ])
    assert.equal(safeAffiliateUrl({ ...active, affiliateUrl }, now), null);
  assert.equal(safeAffiliateUrl({ ...active, isDemo: true }, now), null);
  assert.equal(
    safeAffiliateUrl({ ...active, lastCheckedAt: "2026-10-19T00:00:00Z" }, now),
    null,
  );
  assert.equal(
    safeAffiliateUrl({ ...active, lastCheckedAt: "2099-01-01T00:00:00Z" }, now),
    null,
  );
  assert.equal(
    safeAffiliateUrl(
      {
        ...active,
        retailer: "walmart",
        affiliateUrl: "https://www.walmart.com/example",
      },
      now,
    ),
    "https://www.walmart.com/example",
  );
});
test("saved storage recovers safely from malformed data", () => {
  assert.deepEqual(parseSaved("not json"), []);
  assert.deepEqual(parseSaved("{}"), []);
  assert.deepEqual(parseSaved('["demo-1","demo-1",null,42,"demo-2"]'), [
    "demo-1",
    "demo-2",
  ]);
});
test("analytics remain opt-in and require a configured provider", () => {
  assert.equal(shouldCollectAnalytics("unknown", true), false);
  assert.equal(shouldCollectAnalytics("declined", true), false);
  assert.equal(shouldCollectAnalytics("granted", false), false);
  assert.equal(shouldCollectAnalytics("granted", true), true);
});
