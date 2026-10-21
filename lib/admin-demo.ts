import { categoryChinese } from "./i18n/catalog";
import { categories, products, retailers } from "./data";
export type DemoRecord = Record<string, string | number | boolean | null> & {
  id: string;
};
export type AdminTab =
  | "products"
  | "categories"
  | "retailers"
  | "affiliate_links"
  | "deal_sources"
  | "offers";
export type AdminRecords = Record<AdminTab, DemoRecord[]>;
export const demoAdminRecords: AdminRecords = {
  products: products.map((p) => ({
    id: p.id,
    name: p.name,
    name_zh: p.nameZh,
    content_scope: "neutral",
    content_retailer_id: null,
    description_zh: p.descriptionZh,
    slug: p.slug,
    description: p.description,
    category_id: p.category,
    retailer_id: p.retailer,
    merchant: p.merchant,
    source_id: p.sourceId,
    image_url: p.imageUrl,
    image_license: p.imageLicense,
    status: p.status,
    is_demo: true,
    last_checked_at: null,
    expires_at: null,
  })),
  categories: categories.map((c) => ({
    id: c.slug,
    name: c.name,
    name_zh: categoryChinese[c.slug] || c.name,
    slug: c.slug,
    description: c.description,
  })),
  retailers: retailers.map((r) => ({
    id: r.slug,
    name: r.name,
    slug: r.slug,
    homepage_url: `https://${r.allowedHosts[0]}`,
    enabled: false,
    affiliate_approved: false,
    allowed_hosts: r.allowedHosts.join(","),
  })),
  offers: [],
  affiliate_links: [],
  deal_sources: retailers.map((r) => ({
    id: `demo-source-${r.slug}`,
    name: `${r.name} demo concepts`,
    merchant: r.name,
    retailer_id: r.slug,
    source_type: "manual",
    enabled: false,
    affiliate_approved: false,
    homepage_url: `https://${r.allowedHosts[0]}`,
  })),
};
