import { z } from "zod";
import { newYorkToday } from "./living";
export const assistantSource = z.object({
  url: z
    .url()
    .max(1500)
    .refine((value) => new URL(value).protocol === "https:"),
  text: z.string().trim().min(80).max(16000),
});
const bilingual = (min: number, max: number) =>
  z.object({
    en: z.string().trim().min(min).max(max),
    zh: z.string().trim().min(min).max(max),
  });
export const assistantDraft = z.object({
  title: bilingual(8, 100),
  description: bilingual(40, 4500),
  date: z.string().date(),
  dateEvidence: z.string().trim().min(4).max(500),
  placeEvidence: z.string().trim().min(2).max(500),
  warnings: z.array(z.string().max(300)).max(8),
});
export type AssistantDraft = z.infer<typeof assistantDraft>;
export function validateAssistantDraft(
  input: unknown,
  text: string,
  today = newYorkToday(),
) {
  const draft = assistantDraft.parse(input);
  // Evidence must be an exact excerpt. The administrator still verifies interpretation.
  if (!text.includes(draft.dateEvidence) || !text.includes(draft.placeEvidence))
    throw new Error("evidence");
  if (draft.date < today) throw new Error("past");
  return draft;
}
export function assistantSchema() {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      title: {
        type: "object",
        additionalProperties: false,
        properties: { en: { type: "string" }, zh: { type: "string" } },
        required: ["en", "zh"],
      },
      description: {
        type: "object",
        additionalProperties: false,
        properties: { en: { type: "string" }, zh: { type: "string" } },
        required: ["en", "zh"],
      },
      date: { type: "string" },
      dateEvidence: { type: "string" },
      placeEvidence: { type: "string" },
      warnings: { type: "array", items: { type: "string" } },
    },
    required: [
      "title",
      "description",
      "date",
      "dateEvidence",
      "placeEvidence",
      "warnings",
    ],
  };
}
