import test from "node:test";
import assert from "node:assert/strict";
import {
  ownerListingQuery,
  ownerListingHref,
  ownerListingDisplayStatus,
} from "../lib/account-listings";

test("owner queries constrain statuses, reject unsafe pagination and keep fixed section scopes", () => {
  assert.deepEqual(
    ownerListingQuery("listings", { status: "expired", page: "2" }),
    { status: "expired", page: 2, from: 12, to: 23 },
  );
  assert.equal(
    ownerListingQuery("drafts", { status: "approved" }).status,
    "draft",
  );
  assert.equal(
    ownerListingQuery("pending", { status: "archived" }).status,
    "pending",
  );
  assert.equal(
    ownerListingQuery("listings", { status: "eq.archived),user_id.eq.other" })
      .status,
    "",
  );
  for (const page of [
    "-1",
    "NaN",
    "Infinity",
    "1e3",
    "2.5",
    "9999999999999999999999",
  ])
    assert.equal(ownerListingQuery("listings", { page }).page, 1);
  assert.equal(ownerListingQuery("listings", { page: "2000" }).page, 1000);
  assert.equal(
    ownerListingQuery("listings", {
      page: ["2", "3"],
      status: ["draft", "approved"],
    }).page,
    1,
  );
});

test("owner navigation preserves status on pagination and creates internal links only", () => {
  assert.equal(
    ownerListingHref("listings", "rejected", 2),
    "/account/listings?status=rejected&page=2",
  );
  assert.equal(
    ownerListingHref("drafts", "draft", 2),
    "/account/drafts?page=2",
  );
  assert.equal(
    ownerListingHref("https://outside.invalid", "unsafe"),
    "/account/listings",
  );
});

test("expired approved records display as expired without waiting for an expiry job", () => {
  const now = Date.parse("2026-10-29T12:00:00Z");
  assert.equal(
    ownerListingDisplayStatus("approved", "2026-10-29T12:00:00Z", now),
    "expired",
  );
  assert.equal(
    ownerListingDisplayStatus("approved", "2026-10-30T12:00:00Z", now),
    "approved",
  );
  for (const status of ["draft", "rejected", "archived"])
    assert.equal(
      ownerListingDisplayStatus(status, "2026-10-28T12:00:00Z", now),
      status,
    );
  assert.equal(ownerListingDisplayStatus("approved", null, now), "approved");
  assert.equal(
    ownerListingDisplayStatus("approved", "invalid", now),
    "approved",
  );
});
