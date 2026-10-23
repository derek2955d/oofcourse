import { test } from "node:test";
import assert from "node:assert/strict";
import {
  categoryKeys,
  categoryData,
  parseQuery,
  filterListings,
  type Listing,
} from "../lib/catalog";
import { listingInput, draftInput, riskFlags } from "../lib/validation";
import { safeNext, uploadSignature } from "../lib/security";
import { jobStructuredData, safeJson } from "../lib/structured-data";
import en from "../messages/en.json";
import zh from "../messages/zh.json";
const now = Date.parse("2026-10-23T12:00:00Z");
const listing: Listing = {
  id: "10000000-0000-0000-0000-000000000001",
  user_id: "00000000-0000-0000-0000-000000000001",
  category: "marketplace",
  subcategory: "furniture",
  location: "queens",
  title: "A bilingual chair 椅子",
  description: "An isolated test fixture, never production content.",
  price: 10,
  currency: "USD",
  status: "approved",
  details: { condition: "good", pickup: "Public place" },
  created_at: "2026-10-23T10:00:00Z",
  updated_at: "2026-10-23T10:00:00Z",
  published_at: "2026-10-23T10:00:00Z",
  expires_at: "2026-10-24T10:00:00Z",
  images: [],
};
test("six unified categories, complete bilingual messages, no seeded listing data", () => {
  assert.equal(categoryKeys.length, 6);
  for (const key of categoryKeys) {
    assert.ok(categoryData[key].en && categoryData[key].zh);
    assert.ok(categoryData[key].subtypes.length >= 7);
  }
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zh).sort());
  assert.ok(!categoryKeys.includes("students" as never));
});
test("search, filters, sorting and expiry use real facts, including original Chinese text", () => {
  assert.equal(
    filterListings([listing], parseQuery({ q: "椅子" }), now).length,
    1,
  );
  assert.equal(
    filterListings(
      [listing],
      parseQuery({ q: "chair", location: "brooklyn" }),
      now,
    ).length,
    0,
  );
  assert.equal(
    filterListings([listing], parseQuery({ min: "20" }), now).length,
    0,
  );
  assert.equal(
    filterListings([listing], parseQuery({ free: "1" }), now).length,
    0,
  );
  assert.equal(
    filterListings([{ ...listing, status: "pending" }], parseQuery({}), now)
      .length,
    0,
  );
  assert.equal(
    filterListings(
      [{ ...listing, expires_at: "2026-10-22T10:00:00Z" }],
      parseQuery({}),
      now,
    ).length,
    0,
  );
  assert.equal(parseQuery({ page: "-8", q: ["bad"] }).page, 1);
});
test("partial drafts are valid but incomplete submissions cannot be published", () => {
  assert.ok(
    draftInput.safeParse({
      category: "housing",
      subcategory: "rent",
      location: "nyc",
      title: "",
      description: "",
      price: null,
      details: {},
    }).success,
  );
  assert.equal(
    listingInput.safeParse({
      category: "housing",
      subcategory: "rent",
      location: "nyc",
      title: "",
      description: "",
      price: null,
      details: {},
    }).success,
    false,
  );
  const v = {
    category: "jobs",
    subcategory: "full-time",
    location: "queens",
    title: "Database validation fixture",
    description:
      "This is an isolated validation test fixture, not a genuine job advertisement.",
    price: null,
    details: {
      company: "Test only",
      salary_min: 30,
      salary_max: 20,
      pay_period: "hour",
      employment: "full-time",
      workplace: "on-site",
      industry: "Test",
    },
  };
  assert.equal(listingInput.safeParse(v).success, false);
  assert.ok(
    listingInput.safeParse({ ...v, details: { ...v.details, salary_max: 40 } })
      .success,
  );
});
test("risk flags assist review without automatically declaring legal compliance", () => {
  assert.ok(
    riskFlags("Fixture", "gift card payment only", "marketplace").includes(
      "suspicious_payment",
    ),
  );
  assert.ok(
    riskFlags("Fixture", "female only", "housing").includes("fairness_review"),
  );
  assert.deepEqual(
    riskFlags("Ordinary fixture", "Plain product description", "marketplace"),
    [],
  );
});
test("redirects reject external and protocol-relative destinations", () => {
  for (const u of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/auth/confirm",
    "/account\r\nLocation:evil",
  ])
    assert.equal(safeNext(u), "/account");
  assert.equal(safeNext("/post?category=housing"), "/post?category=housing");
});
test("uploads check byte signatures and reject SVG or spoofed image content", () => {
  assert.ok(uploadSignature(new Uint8Array([255, 216, 255, 0]), "image/jpeg"));
  assert.equal(
    uploadSignature(new TextEncoder().encode("<svg/>"), "image/jpeg"),
    false,
  );
  assert.equal(
    uploadSignature(new TextEncoder().encode("<svg/>"), "image/svg+xml"),
    false,
  );
});
test("JobPosting schema requires approved, current, structured job facts; JSON cannot terminate a script", () => {
  assert.equal(
    jobStructuredData(listing, { city: "New York", state: "NY" }, "en", now),
    null,
  );
  const job = {
    ...listing,
    category: "jobs" as const,
    details: {
      company: "Test only",
      salary_min: 20,
      salary_max: 30,
      pay_period: "hour",
      employment: "full-time",
      workplace: "on-site",
    },
  };
  const schema = jobStructuredData(
    job,
    { city: "New York", state: "NY" },
    "zh",
    now,
  );
  assert.equal(schema?.["@type"], "JobPosting");
  assert.equal(
    jobStructuredData(
      { ...job, status: "expired" },
      { city: "New York", state: "NY" },
      "en",
      now,
    ),
    null,
  );
  assert.ok(
    !safeJson({ value: "</script><script>test</script>" }).includes("<"),
  );
});
