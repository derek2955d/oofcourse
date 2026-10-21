import { test } from "node:test";
import assert from "node:assert/strict";
import {
  authorizedOfferUrl,
  authorizedPrice,
  type OfferRecord,
} from "../lib/offers";
import { selectProducts } from "../lib/data";
import { localePath, switchLocalePath } from "../lib/i18n/config";
const now = Date.parse("2026-10-21T12:00:00Z");
const retailer = {
  id: "independent-retailer",
  name: "Any Store",
  allowedHosts: ["shop.example"],
  enabled: true,
  affiliateApproved: true,
};
const content = {
  scope: "neutral" as const,
  retailerId: null,
  license: "Owned",
};
const offer: OfferRecord = {
  id: "o1",
  productId: "p1",
  retailerId: retailer.id,
  sourceId: "source",
  sourceRetailerId: retailer.id,
  sourceApproved: true,
  status: "published",
  isDemo: false,
  currency: "USD",
  currentPrice: 10,
  originalPrice: 20,
  priceVerified: true,
  priceUsageAuthorized: true,
  checkedAt: "2026-10-21T11:00:00Z",
  expiresAt: "2026-10-22T12:00:00Z",
  affiliateUrl: "https://shop.example/item",
  affiliateApproved: true,
  content,
};
test("arbitrary approved retailer offers enforce both content licenses and destination provenance", () => {
  assert.equal(
    authorizedOfferUrl(offer, retailer, content, now),
    "https://shop.example/item",
  );
  for (const patch of [
    { sourceRetailerId: "other" },
    { isDemo: true },
    { sourceApproved: false },
    { checkedAt: "2026-10-19T12:00:00Z" },
    { affiliateUrl: "https://shop.example.evil.test/item" },
    { affiliateUrl: "javascript:alert(1)" },
    {
      content: {
        scope: "retailer_restricted" as const,
        retailerId: "other",
        license: "Licensed",
      },
    },
  ])
    assert.equal(
      authorizedOfferUrl({ ...offer, ...patch }, retailer, content, now),
      null,
    );
  assert.equal(
    authorizedOfferUrl(
      offer,
      retailer,
      {
        scope: "retailer_restricted",
        retailerId: "other",
        license: "Licensed",
      },
      now,
    ),
    null,
  );
  assert.equal(authorizedPrice({ ...offer, isDemo: true }), null);
  assert.equal(
    authorizedPrice({ ...offer, priceUsageAuthorized: false }),
    null,
  );
  assert.deepEqual(authorizedPrice(offer), { amount: 10, currency: "USD" });
});
test("bilingual search uses shared facts and stable identities", () => {
  const en = selectProducts({ q: "headphones" }),
    zh = selectProducts({ q: "耳机" });
  assert.equal(en.length, 1);
  assert.deepEqual(
    zh.map((p) => p.id),
    en.map((p) => p.id),
  );
  assert.ok(zh[0].nameZh);
  assert.ok(zh[0].descriptionZh);
  assert.equal(selectProducts({ category: "fashion" }).length, 0);
});
test("locale switch preserves path and encoded query without double prefixes", () => {
  assert.equal(localePath("zh", "/en/deals"), " /zh/deals".trim());
  assert.equal(
    switchLocalePath("/en/search", "q=%E8%80%B3%E6%9C%BA&saved=1", "zh"),
    "/zh/search?q=%E8%80%B3%E6%9C%BA&saved=1",
  );
  assert.equal(localePath("en", "/"), " /en".trim());
});
