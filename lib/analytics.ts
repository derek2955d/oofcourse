/** Analytics contract only. No collection, cookies, provider, or network sink is enabled. */
export type DiscoveryEvent = {
  type:
    | "page_view"
    | "search"
    | "product_view"
    | "merchant_click"
    | "save"
    | "category_view";
  productId?: string;
  retailer?: "amazon" | "walmart";
  category?: string;
  path?: string;
};
export type ConsentState = "unknown" | "declined" | "granted";
export function shouldCollectAnalytics(
  consent: ConsentState,
  providerConfigured: boolean,
) {
  return consent === "granted" && providerConfigured;
}
// Do not send raw search queries, email, IP addresses, or stable visitor identifiers.
// Merchant clicks are discovery events, never orders or commissions. Revenue belongs
// to the merchant's official affiliate reporting, not this contract.
