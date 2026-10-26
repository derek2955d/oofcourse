import test from "node:test";
import assert from "node:assert/strict";
import {
  usStates,
  availableStates,
  activeState,
  legacyStateScope,
  normalizeState,
  stateLabel,
  cookieState,
} from "../lib/geography";
import { defaultTaxonomy } from "../lib/taxonomy";
import { parseQuery, filterListings, type Listing } from "../lib/catalog";
test("state choices are states/DC, not city or neighborhood records", () => {
  assert.equal(usStates.length, 51);
  assert.equal(new Set(usStates.map((x) => x[0])).size, 51);
  assert.equal(normalizeState(" ca "), "CA");
  assert.equal(normalizeState("queens"), "NY");
  assert.equal(stateLabel("NY", "zh"), "纽约");
  assert.equal(cookieState("x=1; oofcourse_state=CA"), "NY");
  assert.equal(defaultTaxonomy.locationStates.queens, "NY");
  assert.ok(
    !usStates.some((s) => ["Brooklyn", "New York City"].includes(s[1])),
  );
});
test("statewide filters and local-area filters are distinct and cannot cross states", () => {
  const base = {
    id: "fixture",
    user_id: "fixture",
    category: "marketplace",
    subcategory: "furniture",
    title: "Private geographic fixture",
    description: "Never published",
    price: 10,
    currency: "USD",
    status: "approved",
    details: {},
    created_at: "2026-10-25",
    updated_at: "2026-10-25",
    published_at: "2026-10-25",
    expires_at: "2099-01-01",
    images: [],
  } as const;
  const items = [
    { ...base, location: "queens", state: "NY" },
    { ...base, location: "los-angeles", state: "CA" },
  ] as unknown as Listing[];
  assert.equal(parseQuery({ state: "CA" }).location, "");
  assert.deepEqual(
    filterListings(items, parseQuery({ state: "CA" })).map((x) => x.location),
    ["los-angeles"],
  );
  assert.equal(
    filterListings(items, parseQuery({ state: "CA", location: "queens" }))
      .length,
    0,
  );
  assert.deepEqual(
    filterListings(items, parseQuery({ state: "NY" })).map((x) => x.location),
    ["queens"],
  );
});

test("legacy NY compatibility proves scope before using the old RPC", () => {
  const ny = [
    { id: "nyc", state: "NY", city: "New York" },
    { id: "queens", state: "NY", city: "New York" },
  ];
  const mixed = [...ny, { id: "la", state: "CA", city: "Los Angeles" }];
  assert.equal(legacyStateScope(ny, "NY"), "safe");
  assert.equal(legacyStateScope(ny, "CA"), "empty");
  assert.equal(legacyStateScope(mixed, "NY"), "migration-required");
  assert.equal(legacyStateScope(mixed, "NY", "queens"), "safe");
  assert.equal(legacyStateScope(mixed, "CA", "queens"), "empty");
  assert.equal(legacyStateScope(mixed, "NY", "nyc"), "safe");
  assert.equal(
    legacyStateScope(
      [...ny, { id: "collision", state: "CA", city: "New York" }],
      "NY",
      "nyc",
    ),
    "migration-required",
  );
});

test("consumer rollout opens only New York and retains future geographic reference data", () => {
  assert.deepEqual(
    availableStates.map((s) => s[0]),
    ["NY"],
  );
  assert.equal(activeState("CA"), "NY");
  assert.equal(activeState("NJ"), "NY");
  assert.equal(activeState("NY"), "NY");
  assert.equal(normalizeState("CA"), "CA");
});
