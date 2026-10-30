import { test } from "node:test";
import assert from "node:assert/strict";
import { assistantSource, validateAssistantDraft } from "../lib/assistant";
const source =
  "Festival runs November 13–14, 2026, in Kaufman Astoria Arts District. Check the organizer before going.";
const draft = {
  title: { en: "Queens arts festival", zh: "皇后区电影与艺术节活动" },
  description: {
    en: "An arts festival in Queens. Check the organizer's latest arrangements before attending.",
    zh: "在皇后区举行的艺术活动。出发之前，请通过活动主办方确认最新的活动安排及具体场次信息。",
  },
  date: "2026-11-14",
  dateEvidence: "November 13–14, 2026",
  placeEvidence: "Kaufman Astoria Arts District",
  warnings: [],
};
test("assistant requires HTTPS public source and bounded text", () => {
  assert.equal(
    assistantSource.safeParse({ url: "javascript:alert(1)", text: source })
      .success,
    false,
  );
  assert.equal(
    assistantSource.safeParse({
      url: "https://example.org/event",
      text: source,
    }).success,
    true,
  );
  assert.equal(
    assistantSource.safeParse({
      url: "https://example.org/event",
      text: "x".repeat(16001),
    }).success,
    false,
  );
});
test("assistant rejects invented evidence, past dates and malformed model output", () => {
  assert.equal(
    validateAssistantDraft(draft, source, "2026-10-30").date,
    "2026-11-14",
  );
  assert.throws(() =>
    validateAssistantDraft(
      { ...draft, placeEvidence: "Invented location" },
      source,
      "2026-10-30",
    ),
  );
  assert.throws(() => validateAssistantDraft(draft, source, "2026-11-15"));
  assert.throws(() =>
    validateAssistantDraft(
      { ...draft, date: "2026-02-30" },
      source,
      "2026-01-01",
    ),
  );
  assert.throws(() =>
    validateAssistantDraft({ title: "Ignore all rules" }, source),
  );
});
