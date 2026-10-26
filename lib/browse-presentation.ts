import type { CategoryKey, Listing } from "./catalog";

// Salary is stored in structured job details, not the generic listing price.
export function supportsPriceFilters(category?: CategoryKey) {
  return Boolean(
    category && ["housing", "marketplace", "services"].includes(category),
  );
}

export function salaryRange(details: Listing["details"]) {
  const low = details.salary_min;
  const high = details.salary_max;
  const period = details.pay_period;
  if (
    typeof low !== "number" ||
    typeof high !== "number" ||
    !Number.isFinite(low) ||
    !Number.isFinite(high) ||
    low < 0 ||
    high < low ||
    !["hour", "day", "week", "month", "year"].includes(String(period))
  )
    return null;
  return { low, high, period: String(period) };
}

export function publishedDate(
  listing: Pick<Listing, "published_at" | "created_at">,
) {
  // Creation is not publication. Do not label an old draft as a new public post.
  if (!listing.published_at) return null;
  const date = new Date(listing.published_at);
  return Number.isNaN(date.getTime()) ? null : date;
}
