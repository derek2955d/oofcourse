import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categories,
  products,
  selectProducts,
  safeAffiliateUrl,
} from "../lib/data";
test("demo catalog has complete, unique and consistent records", () => {
  assert.equal(products.length, 12);
  assert.equal(new Set(products.map((p) => p.slug)).size, 12);
  for (const p of products) {
    assert.ok(categories.some((c) => c.slug === p.category));
    assert.equal(
      p.discountPercentage,
      Math.round((1 - p.currentPrice / p.originalPrice) * 100),
    );
    assert.ok(p.lastCheckedAt && p.createdAt && p.expiresAt);
    assert.equal(safeAffiliateUrl(p), null);
  }
});
test("search is case insensitive, trims whitespace, and combines with categories", () => {
  assert.equal(selectProducts({ q: "  HEADPHONES  " }).length, 1);
  assert.equal(selectProducts({ q: "headphones", category: "home" }).length, 0);
  assert.equal(selectProducts({ q: "no-such-product" }).length, 0);
  assert.equal(selectProducts({ category: "wellness" }).length, 2);
});
test("sort order reflects price and savings", () => {
  for (const sort of ["price-asc", "price-desc", "savings"]) {
    const result = selectProducts({ sort });
    for (let i = 1; i < result.length; i++)
      assert.ok(
        sort === "price-asc"
          ? result[i - 1].currentPrice <= result[i].currentPrice
          : sort === "price-desc"
            ? result[i - 1].currentPrice >= result[i].currentPrice
            : result[i - 1].discountPercentage >= result[i].discountPercentage,
      );
  }
});
test("affiliate gate rejects demo, expired, unsafe and unapproved destinations", () => {
  const p = { ...products[0], affiliateUrl: "https://www.amazon.com/example" };
  assert.equal(safeAffiliateUrl(p), null);
  const active = {
    ...p,
    status: "active" as const,
    expiresAt: "2099-01-01T00:00:00Z",
  };
  assert.ok(safeAffiliateUrl(active));
  for (const affiliateUrl of [
    "javascript:alert(1)",
    "http://amazon.com/x",
    "https://amazon.com.evil.test/x",
    "https://user:pass@amazon.com/x",
    "garbage",
  ])
    assert.equal(safeAffiliateUrl({ ...active, affiliateUrl }), null);
  assert.equal(
    safeAffiliateUrl({ ...active, expiresAt: "2020-01-01T00:00:00Z" }),
    null,
  );
  assert.equal(safeAffiliateUrl({ ...active, expiresAt: "invalid" }), null);
});
