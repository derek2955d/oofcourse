import { test } from "node:test";
import assert from "node:assert/strict";
import { activityYearSamples } from "../lib/activity-year-preview";
test("year preview contains 24 private-layout archive concepts and 8 next-month concepts", () => {
  const samples = activityYearSamples("2026-10-30");
  const past = samples.filter((s) => s.period === "archive");
  const future = samples.filter((s) => s.period === "upcoming");
  assert.equal(past.length, 24);
  assert.equal(future.length, 8);
  assert.equal(new Set(past.map((s) => s.day.slice(0, 7))).size, 12);
  assert.equal(new Set(past.map((s) => s.title.en)).size, 24);
  assert.ok(past.every((s) => s.day < "2026-10-30" && s.day >= "2025-10-30"));
  assert.ok(future.every((s) => s.day > "2026-10-30" && s.day <= "2026-11-30"));
  assert.equal(new Set(samples.map((s) => s.slug)).size, 32);
});
