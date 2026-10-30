import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeEditorialActivities,
  archivedEditorialActivities,
  editorialActivities,
  getEditorialActivity,
} from "../lib/editorial-activities";
test("editorial opening facts remain separate from member listings and expire after opening day", () => {
  assert.equal(activeEditorialActivities("2026-10-25").length, 0);
  assert.equal(activeEditorialActivities("2026-10-26").length, 1);
  assert.equal(activeEditorialActivities("2026-10-28").length, 1);
  assert.equal(
    activeEditorialActivities("2026-10-29").some(
      (item) => item.slug === editorialActivities[0].slug,
    ),
    false,
  );
  assert.equal(activeEditorialActivities("2027-02-28").length, 0);
  const first = editorialActivities[0];
  assert.equal(new URL(first.sourceUrl).hostname, "bryantpark.org");
  assert.equal(first.startsAt, "2026-10-28T12:00:00-04:00");
  assert.ok(first.fees.zh.includes("另收费"));
  assert.equal("user_id" in first, false);
  assert.equal("price" in first, false);
  assert.equal(getEditorialActivity("missing"), undefined);
});

test("new nearby event notes expire after their last calendar day and keep unknown times date-only", () => {
  assert.equal(activeEditorialActivities("2026-10-29").length, 2);
  assert.ok(
    activeEditorialActivities("2026-10-31").some(
      (item) => item.slug === "village-halloween-parade-2026",
    ),
  );
  assert.equal(
    activeEditorialActivities("2026-11-01").some(
      (item) => item.slug === "village-halloween-parade-2026",
    ),
    false,
  );
  assert.ok(
    activeEditorialActivities("2026-11-14").some(
      (item) => item.slug === "queens-film-arts-festival-2026",
    ),
  );
  assert.equal(
    activeEditorialActivities("2026-11-15").some(
      (a) => a.slug === "queens-film-arts-festival-2026",
    ),
    false,
  );
  assert.equal(
    getEditorialActivity("queens-film-arts-festival-2026")?.startsAt,
    "2026-11-13",
  );
});

test("event publishing requires a real date while ordinary community announcements do not", async () => {
  const { listingInput } = await import("../lib/validation");
  const item = {
    category: "community",
    subcategory: "events",
    location: "queens",
    title: "Isolated calendar note",
    description:
      "An isolated validation fixture that must never be published to a real service.",
    price: null,
    details: { topic: "Local event" },
  };
  assert.equal(listingInput.safeParse(item).success, false);
  assert.equal(
    listingInput.safeParse({
      ...item,
      details: { ...item.details, event_date: "2026-10-31" },
    }).success,
    true,
  );
  assert.equal(
    listingInput.safeParse({ ...item, subcategory: "announcements" }).success,
    true,
  );
});

test("sourced activity archive uses real dated records within three months and upcoming notes within one month", () => {
  const past = archivedEditorialActivities("2026-10-30");
  const upcoming = activeEditorialActivities("2026-10-30");
  assert.equal(past.length, 7);
  assert.equal(upcoming.length, 6);
  assert.ok(past.every((a) => a.day >= "2026-07-30" && a.day < "2026-10-30"));
  assert.ok(
    upcoming.every(
      (a) => a.day >= "2026-10-30" && a.startsAt.slice(0, 10) <= "2026-11-30",
    ),
  );
  for (const a of [...past, ...upcoming]) {
    assert.equal(new URL(a.sourceUrl).protocol, "https:");
    assert.ok(a.title.en && a.title.zh && a.summary.en && a.summary.zh);
  }
  assert.ok(
    upcoming.some((a) => a.slug === "macys-thanksgiving-day-parade-2026"),
  );
  assert.equal(
    past.some((a) => a.slug.includes("2027")),
    false,
  );
});
