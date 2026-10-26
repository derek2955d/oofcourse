import type { CategoryKey } from "./catalog";
export type FieldSpec = {
  key: string;
  type: "select" | "number" | "date" | "text" | "textarea";
  options?: string[];
  optional?: boolean;
};
export const detailFields: Record<CategoryKey, FieldSpec[]> = {
  housing: [
    { key: "tenure", type: "select", options: ["rent", "sale"] },
    {
      key: "property_type",
      type: "select",
      options: ["apartment", "house", "room", "commercial", "parking"],
    },
    { key: "bedrooms", type: "number" },
    { key: "bathrooms", type: "number" },
    { key: "furnished", type: "select", options: ["yes", "no", "partial"] },
    { key: "availability", type: "date" },
    {
      key: "broker_fee_payer",
      type: "select",
      options: ["none", "landlord", "tenant", "not-applicable"],
    },
    { key: "fee_disclosure", type: "textarea" },
    { key: "nearby", type: "text", optional: true },
  ],
  jobs: [
    { key: "company", type: "text" },
    { key: "salary_min", type: "number" },
    { key: "salary_max", type: "number" },
    {
      key: "pay_period",
      type: "select",
      options: ["hour", "day", "week", "month", "year"],
    },
    {
      key: "employment",
      type: "select",
      options: ["full-time", "part-time", "internship", "contract"],
    },
    {
      key: "workplace",
      type: "select",
      options: ["on-site", "hybrid", "remote"],
    },
    { key: "industry", type: "text" },
    { key: "benefits", type: "textarea", optional: true },
  ],
  marketplace: [
    {
      key: "condition",
      type: "select",
      options: ["new", "like-new", "good", "fair"],
    },
    { key: "pickup", type: "text" },
  ],
  services: [
    {
      key: "provider_type",
      type: "select",
      options: ["individual", "business"],
    },
    {
      key: "price_type",
      type: "select",
      options: ["fixed", "hourly", "quote"],
    },
    { key: "service_area", type: "text" },
  ],
  businesses: [
    { key: "business_name", type: "text" },
    { key: "service_type", type: "text" },
    { key: "website", type: "text", optional: true },
    { key: "opening_hours", type: "text", optional: true },
  ],
  community: [
    { key: "topic", type: "text" },
    { key: "event_date", type: "date", optional: true },
  ],
};
export const filterFields: Record<CategoryKey, string[]> = {
  housing: [
    "tenure",
    "property_type",
    "bedrooms",
    "bathrooms",
    "furnished",
    "availability",
    "nearby",
  ],
  jobs: ["employment"],
  marketplace: [],
  services: ["service_area", "provider_type", "price_type"],
  businesses: ["service_type"],
  community: ["topic", "event_date"],
};
