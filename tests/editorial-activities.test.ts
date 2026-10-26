import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeEditorialActivities,
  editorialActivities,
  getEditorialActivity,
} from "../lib/editorial-activities";
test("editorial opening facts remain separate from member listings and expire after opening day", () => {
  assert.equal(activeEditorialActivities("2026-10-25").length, 0);
  assert.equal(activeEditorialActivities("2026-10-26").length, 1);
  assert.equal(activeEditorialActivities("2026-10-28").length, 1);
  assert.equal(activeEditorialActivities("2026-10-29").length, 0);
  assert.equal(activeEditorialActivities("2027-02-28").length, 0);
  const first = editorialActivities[0];
  assert.equal(new URL(first.sourceUrl).hostname, "bryantpark.org");
  assert.equal(first.startsAt, "2026-10-28T12:00:00-04:00");
  assert.ok(first.fees.zh.includes("另收费"));
  assert.equal("user_id" in first, false);
  assert.equal("price" in first, false);
  assert.equal(getEditorialActivity("missing"), undefined);
});
