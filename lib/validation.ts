import { z } from "zod";
import { categoryKeys, type CategoryKey } from "./catalog";
const choice = (v: readonly string[]) =>
  z.string().refine((x) => v.includes(x), "invalidChoice");
const number = z.number().finite().min(0).max(100000000);
const text = z.string().trim().max(500);
export const detailSchemas = {
  housing: z.object({
    tenure: choice(["rent", "sale"]),
    property_type: choice([
      "apartment",
      "house",
      "room",
      "commercial",
      "parking",
    ]),
    bedrooms: z.number().int().min(0).max(30),
    bathrooms: z.number().min(0).max(30),
    furnished: choice(["yes", "no", "partial"]),
    availability: z.string().date(),
    fee_disclosure: z.string().trim().min(10).max(1500),
    broker_fee_payer: choice(["none", "landlord", "tenant", "not-applicable"]),
    nearby: text.optional(),
  }),
  jobs: z
    .object({
      company: z.string().trim().min(2).max(150),
      salary_min: number,
      salary_max: number,
      pay_period: choice(["hour", "day", "week", "month", "year"]),
      employment: choice(["full-time", "part-time", "internship", "contract"]),
      workplace: choice(["on-site", "hybrid", "remote"]),
      industry: text.min(2),
      benefits: text.optional(),
    })
    .refine((d) => d.salary_max >= d.salary_min, {
      path: ["salary_max"],
      message: "salaryRange",
    }),
  marketplace: z.object({
    condition: choice(["new", "like-new", "good", "fair"]),
    pickup: text.min(2),
  }),
  services: z.object({
    provider_type: choice(["individual", "business"]),
    price_type: choice(["fixed", "hourly", "quote"]),
    service_area: text.min(2),
  }),
  businesses: z.object({
    business_name: text.min(2),
    service_type: text.min(2),
    website: z
      .union([
        z.literal(""),
        z.url().refine((u) => new URL(u).protocol === "https:"),
      ])
      .optional(),
    opening_hours: text.optional(),
  }),
  community: z.object({
    outing_type: z
      .enum(["outdoors", "waterfront", "art", "daytrip"])
      .optional(),
    outing_place: text.optional(),
    outing_area: z.enum(["nyc", "nj", "hudson"]).optional(),
    event_date: z.union([z.literal(""), z.string().date()]).optional(),
    topic: text.min(2),
  }),
};
export const listingInput = z
  .object({
    id: z.uuid().optional(),
    category: z.enum(categoryKeys),
    subcategory: text.min(1),
    location: z.string().regex(/^[a-z0-9-]{1,80}$/),
    title: z.string().trim().min(8, "titleInvalid").max(100, "titleInvalid"),
    description: z
      .string()
      .trim()
      .min(40, "descriptionInvalid")
      .max(6000, "descriptionInvalid"),
    price: number.nullable(),
    details: z.record(z.string(), z.unknown()),
  })
  .superRefine((v, ctx) => {
    if (
      v.category === "community" &&
      v.subcategory === "events" &&
      !z.string().date().safeParse(v.details.event_date).success
    )
      ctx.addIssue({
        code: "custom",
        path: ["details", "event_date"],
        message: "validation",
      });
    if (v.category === "community" && v.subcategory === "outings") {
      if (
        !["outdoors", "waterfront", "art", "daytrip"].includes(
          String(v.details.outing_type),
        )
      )
        ctx.addIssue({
          code: "custom",
          path: ["details", "outing_type"],
          message: "validation",
        });
      if (
        typeof v.details.outing_place !== "string" ||
        v.details.outing_place.trim().length < 3
      )
        ctx.addIssue({
          code: "custom",
          path: ["details", "outing_place"],
          message: "validation",
        });
    }
    const d = detailSchemas[v.category].safeParse(v.details);
    if (!d.success)
      for (const e of d.error.issues)
        ctx.addIssue({
          code: "custom",
          path: ["details", ...e.path],
          message: e.message,
        });
    if (["housing", "marketplace"].includes(v.category) && v.price === null)
      ctx.addIssue({
        code: "custom",
        path: ["price"],
        message: "priceRequired",
      });
  });
export function validateDetails(
  category: CategoryKey,
  details: unknown,
  subcategory?: string,
) {
  const parsed = detailSchemas[category].parse(details);
  if (category === "community" && subcategory && subcategory !== "outings") {
    const copy: Record<string, unknown> = { ...parsed };
    delete copy.outing_type;
    delete copy.outing_area;
    delete copy.outing_place;
    return copy;
  }
  return parsed;
}
export const profileInput = z.object({
  display_name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(500),
});
export const businessInput = z.object({
  name: text.min(2),
  category: text.min(2),
  location: z.string().regex(/^[a-z0-9-]{1,80}$/),
  description: z.string().trim().min(40).max(3000),
  website: z.union([
    z.literal(""),
    z.url().refine((u) => new URL(u).protocol === "https:"),
  ]),
});
export const reportInput = z.object({
  listing_id: z.uuid(),
  reason: choice([
    "scam",
    "discrimination",
    "prohibited",
    "misleading",
    "privacy",
    "other",
  ]),
  description: z.string().trim().min(10).max(2000),
});
export const contactInput = z.object({
  listing_id: z.uuid(),
  body: z.string().trim().min(10).max(2000),
});
export function riskFlags(
  title: string,
  description: string,
  category: CategoryKey,
) {
  const value = `${title} ${description}`.toLowerCase();
  const flags: string[] = [];
  if (
    /(?:wire transfer|gift card|crypto only|汇款|礼品卡|加密货币)/i.test(value)
  )
    flags.push("suspicious_payment");
  if (/(.)\1{8,}|https?:\/\/\S+/i.test(value)) flags.push("spam_review");
  if (
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/i.test(
      value,
    )
  )
    flags.push("personal_contact_review");
  if (
    ["housing", "jobs"].includes(category) &&
    /(?:no (?:kids|children|immigrants)|(?:male|female|chinese|white|asian) only|只限(?:女性|男性|华人)|不要小孩)/i.test(
      value,
    )
  )
    flags.push("fairness_review");
  return flags;
}
export const draftInput = z.object({
  id: z.uuid().optional(),
  category: z.enum(categoryKeys),
  subcategory: text.min(1),
  location: z.string().regex(/^[a-z0-9-]{1,80}$/),
  title: z.string().max(100),
  description: z.string().max(6000),
  price: number.nullable(),
  details: z.record(z.string(), z.unknown()),
});
