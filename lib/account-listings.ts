export const ownerListingStatuses = [
  "draft",
  "pending",
  "approved",
  "rejected",
  "expired",
  "archived",
] as const;
export type OwnerListingStatus = (typeof ownerListingStatuses)[number];
export const ownerPageSize = 12;
export function ownerListingQuery(
  section: string,
  raw: Record<string, string | string[] | undefined>,
) {
  const rawStatus = typeof raw.status === "string" ? raw.status : "";
  const status =
    section === "drafts"
      ? "draft"
      : section === "pending"
        ? "pending"
        : ownerListingStatuses.find((value) => value === rawStatus) || "";
  const rawPage =
    typeof raw.page === "string" && /^\d+$/.test(raw.page)
      ? Number(raw.page)
      : 1;
  const page = Number.isSafeInteger(rawPage)
    ? Math.max(1, Math.min(1000, rawPage))
    : 1;
  return {
    status,
    page,
    from: (page - 1) * ownerPageSize,
    to: page * ownerPageSize - 1,
  };
}
export function ownerListingHref(section: string, status = "", page = 1) {
  const path = `/account/${["listings", "drafts", "pending"].includes(section) ? section : "listings"}`;
  const params = new URLSearchParams();
  if (
    section === "listings" &&
    ownerListingStatuses.some((value) => value === status)
  )
    params.set("status", status);
  if (page > 1) params.set("page", String(page));
  return `${path}${params.size ? `?${params}` : ""}`;
}
export function ownerListingDisplayStatus(
  status: string,
  expiresAt: string | null,
  now = Date.now(),
) {
  return status === "approved" &&
    expiresAt &&
    Number.isFinite(Date.parse(expiresAt)) &&
    Date.parse(expiresAt) <= now
    ? "expired"
    : status;
}
