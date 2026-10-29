import test from "node:test";
import assert from "node:assert/strict";
import {
  weekendPlaces,
  weekendQuery,
  filterWeekendPlaces,
  getWeekendPlace,
  weekendMapUrl,
} from "../lib/weekend";
test("outing notes are bilingual original guides with safe official visitor and map links", () => {
  assert.equal(weekendPlaces.length, 6);
  assert.equal(new Set(weekendPlaces.map((p) => p.slug)).size, 6);
  for (const place of weekendPlaces) {
    for (const key of [
      "name",
      "summary",
      "location",
      "plan",
      "travel",
      "caution",
    ] as const) {
      assert.ok(place[key].en.length > 0);
      assert.ok(place[key].zh.length > 0);
    }
    assert.equal(new URL(place.source).protocol, "https:");
    const map = new URL(weekendMapUrl(place));
    assert.equal(map.hostname, "www.google.com");
    assert.ok(map.searchParams.get("query")?.includes(place.name.en));
    for (const forbidden of ["price", "rating", "available_tickets", "image"])
      assert.equal(forbidden in place, false);
  }
  assert.equal(getWeekendPlace("not-real"), undefined);
});
test("weekend filters combine area and interests without treating guides as live events", () => {
  assert.deepEqual(
    weekendQuery({ type: ["art", "waterfront"], area: "unknown" }),
    { type: "", area: "" },
  );
  assert.deepEqual(
    filterWeekendPlaces(weekendQuery({ type: "art", area: "hudson" })).map(
      (p) => p.slug,
    ),
    ["dia-beacon"],
  );
  assert.equal(
    filterWeekendPlaces(weekendQuery({ type: "art", area: "nj" })).length,
    0,
  );
  assert.equal(
    filterWeekendPlaces(weekendQuery({ area: "nj" }))[0]?.slug,
    "liberty-state-park",
  );
});
