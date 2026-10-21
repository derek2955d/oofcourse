/** Retailer-neutral fact contracts for the website and future App clients. */
export type SourceContent = {
  scope: "neutral" | "retailer_restricted";
  retailerId: string | null;
  license: string | null;
};
export type RetailerRecord = {
  id: string;
  name: string;
  allowedHosts: string[];
  enabled: boolean;
  affiliateApproved: boolean;
};
export type OfferRecord = {
  id: string;
  productId: string;
  retailerId: string;
  sourceId: string;
  sourceRetailerId: string;
  sourceApproved: boolean;
  status:
    | "draft"
    | "pending_review"
    | "published"
    | "unverified"
    | "expired"
    | "archived";
  isDemo: boolean;
  currency: string;
  currentPrice: number | null;
  originalPrice: number | null;
  priceVerified: boolean;
  priceUsageAuthorized: boolean;
  checkedAt: string | null;
  expiresAt: string | null;
  affiliateUrl: string | null;
  affiliateApproved: boolean;
  content: SourceContent;
};
export function canUseContent(content: SourceContent, retailerId: string) {
  return (
    Boolean(content.license) &&
    (content.scope === "neutral"
      ? content.retailerId === null
      : content.retailerId === retailerId)
  );
}
export function authorizedOfferUrl(
  offer: OfferRecord,
  retailer: RetailerRecord,
  productContent: SourceContent,
  now = Date.now(),
): string | null {
  if (
    offer.isDemo ||
    offer.status !== "published" ||
    offer.retailerId !== retailer.id ||
    offer.sourceRetailerId !== retailer.id ||
    !retailer.enabled ||
    !retailer.affiliateApproved ||
    !offer.sourceApproved ||
    !offer.affiliateApproved ||
    !canUseContent(offer.content, retailer.id) ||
    !canUseContent(productContent, retailer.id) ||
    !offer.affiliateUrl
  )
    return null;
  const checked = Date.parse(offer.checkedAt || ""),
    expires = Date.parse(offer.expiresAt || "");
  if (
    !Number.isFinite(checked) ||
    !Number.isFinite(expires) ||
    checked > now ||
    now - checked >= 86400000 ||
    expires <= now
  )
    return null;
  try {
    const url = new URL(offer.affiliateUrl);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      retailer.allowedHosts.includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function authorizedPrice(offer: OfferRecord) {
  return !offer.isDemo &&
    offer.priceVerified &&
    offer.priceUsageAuthorized &&
    offer.currentPrice !== null &&
    Number.isFinite(offer.currentPrice) &&
    offer.currentPrice >= 0
    ? { amount: offer.currentPrice, currency: offer.currency }
    : null;
}
