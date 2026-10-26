import { test } from "node:test";
import assert from "node:assert/strict";
import {
  livingGuides,
  officialCalendars,
  getLivingGuide,
  eventDay,
  newYorkToday,
} from "../lib/living";
test("living guides have complete original bilingual content and official HTTPS sources", () => {
  assert.equal(
    new Set(livingGuides.map((guide) => guide.slug)).size,
    livingGuides.length,
  );
  const hosts = new Set([
    "www.nyc.gov",
    "www.mta.info",
    "consumer.ftc.gov",
    "www.nypl.org",
    "discover.bklynlibrary.org",
    "www.queenslibrary.org",
    "www.nycgovparks.org",
  ]);
  for (const guide of livingGuides) {
    assert.ok(guide.sections.length >= 3);
    for (const locale of ["en", "zh"] as const) {
      assert.ok(
        guide.title[locale] && guide.summary[locale] && guide.tag[locale],
      );
      for (const section of guide.sections) {
        assert.ok(section.title[locale]);
        for (const point of section.points)
          assert.ok(point[locale].length > 15);
      }
    }
    assert.ok(eventDay(guide.updatedAt));
    for (const source of guide.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(hosts.has(url.hostname));
    }
    assert.equal(getLivingGuide(guide.slug), guide);
  }
  assert.equal(getLivingGuide("missing-guide"), undefined);
  for (const calendar of officialCalendars) {
    const url = new URL(calendar.url);
    assert.ok(hosts.has(url.hostname));
    assert.equal(url.protocol, "https:");
    assert.ok(calendar.name.en && calendar.name.zh);
  }
});
test("event dates reject impossible dates and use New York rather than the server's UTC date", () => {
  for (const value of [
    null,
    undefined,
    "",
    "2026-02-30",
    "2026-13-01",
    "2026-1-01",
    "2026-01-01T00:00:00Z",
    "not a date",
  ])
    assert.equal(eventDay(value), null);
  assert.equal(eventDay("2028-02-29"), "2028-02-29");
  assert.equal(eventDay("2026-02-29"), null);
  assert.equal(newYorkToday(new Date("2026-10-26T02:30:00Z")), "2026-10-25");
  assert.equal(newYorkToday(new Date("2026-07-01T03:30:00Z")), "2026-06-30");
  assert.equal(newYorkToday(new Date("2026-01-01T05:30:00Z")), "2026-01-01");
});
