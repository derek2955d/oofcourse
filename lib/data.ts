export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
};
export const categories: Category[] = [
  {
    slug: "home",
    name: "Home & Kitchen",
    description: "Little things that make a home.",
    icon: "home",
    color: "#FFF1DF",
  },
  {
    slug: "tech",
    name: "Electronics",
    description: "Make your everyday a little smarter.",
    icon: "tech",
    color: "#EAF4FF",
  },
  {
    slug: "toys",
    name: "Toys & Kids",
    description: "More play. More possibilities.",
    icon: "toys",
    color: "#F0EDFF",
  },
  {
    slug: "baby",
    name: "Baby",
    description: "Thoughtful finds for little beginnings.",
    icon: "baby",
    color: "#FFF0EE",
  },
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    description: "A little care, just for you.",
    icon: "beauty",
    color: "#FCEEF4",
  },
  {
    slug: "outdoors",
    name: "Sports & Outdoors",
    description: "Good things for getting outside.",
    icon: "outdoors",
    color: "#EAF7EE",
  },
  {
    slug: "pets",
    name: "Pet Supplies",
    description: "For your favorite four-legged family.",
    icon: "pets",
    color: "#FFF3E6",
  },
  {
    slug: "essentials",
    name: "Everyday Essentials",
    description: "The useful things you reach for daily.",
    icon: "essentials",
    color: "#EAF5F3",
  },
];
export type RetailerSlug = "amazon" | "walmart";
export const retailers = [
  {
    slug: "amazon" as const,
    name: "Amazon",
    description:
      "Explore example products organized for Amazon. No approved offers or retailer links are connected.",
    color: "#FFF4E2",
  },
  {
    slug: "walmart" as const,
    name: "Walmart",
    description:
      "Explore example products organized for Walmart. No approved offers or retailer links are connected.",
    color: "#EAF4FF",
  },
];
export const productStatuses = [
  "draft",
  "pending_review",
  "published",
  "unverified",
  "expired",
  "archived",
] as const;
export type ProductStatus = (typeof productStatuses)[number];
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  category: string;
  retailer: RetailerSlug;
  merchant: string;
  imageUrl: string;
  imageLicense: string;
  sourceId: string;
  affiliateUrl: string | null;
  currentPrice: number | null;
  originalPrice: number | null;
  discountPercentage: number | null;
  status: ProductStatus;
  isDemo: boolean;
  priceVerified: boolean;
  affiliateApproved: boolean;
  createdAt: string;
  expiresAt: string | null;
  lastCheckedAt: string | null;
  featured: boolean;
  trending: boolean;
  color: string;
  kind: string;
};
const items = [
  ["Everyday Pour-Over Set", "home", "coffee", "amazon"],
  ["Sunday Ceramic Mug Set", "home", "mugs", "walmart"],
  ["Studio Wireless Headphones", "tech", "headphones", "amazon"],
  ["Pocket Bluetooth Speaker", "tech", "speaker", "walmart"],
  ["Little Builder Block Set", "toys", "blocks", "walmart"],
  ["Weekend Art Kit", "toys", "art", "amazon"],
  ["Soft Cotton Baby Blanket", "baby", "blanket", "amazon"],
  ["Little Steps Stacking Cups", "baby", "cups", "walmart"],
  ["Everyday Care Organizer", "beauty", "organizer", "walmart"],
  ["Gentle Morning Brush Set", "beauty", "brush", "amazon"],
  ["Trailside Daypack · 22L", "outdoors", "backpack", "amazon"],
  ["Everyday Insulated Tumbler", "outdoors", "bottle", "walmart"],
  ["Cozy Pet Bed", "pets", "petbed", "walmart"],
  ["Playtime Rope Toy", "pets", "rope", "amazon"],
  ["Reusable Market Tote", "essentials", "tote", "amazon"],
  ["Everyday Storage Basket", "essentials", "basket", "walmart"],
] as const;
export const products: Product[] = items.map(
  ([name, category, kind, retailer], i) => ({
    id: `demo-${i + 1}`,
    name,
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
    description: `A ${name.toLowerCase()} concept for a more thoughtful everyday. This original illustration demonstrates how a listing could look; it is not an actual ${retailer === "amazon" ? "Amazon" : "Walmart"} product, endorsement, or available offer.`,
    features: [
      "An original concept for everyday family life",
      "Explore the category to compare other ideas",
      "Check fit, materials, safety, and merchant terms before any future purchase",
    ],
    category,
    retailer,
    merchant: retailer === "amazon" ? "Amazon" : "Walmart",
    imageUrl: `/illustrations/${kind}.svg`,
    imageLicense: "Original OofCourse SVG concept artwork",
    sourceId: `demo-source-${retailer}`,
    affiliateUrl: null,
    currentPrice: null,
    originalPrice: null,
    discountPercentage: null,
    status: i === 15 ? "expired" : "unverified",
    isDemo: true,
    priceVerified: false,
    affiliateApproved: false,
    createdAt: `2026-10-${String(14 + Math.floor(i / 3)).padStart(2, "0")}T12:00:00Z`,
    expiresAt: null,
    lastCheckedAt: null,
    featured: i % 2 === 0 && i < 8,
    trending: i >= 8 && i < 12,
    color: categories.find((c) => c.slug === category)!.color,
    kind,
  }),
);
export type ProductQuery = {
  q?: string;
  category?: string;
  retailer?: string;
  sort?: string;
};
export function selectProducts({
  q = "",
  category = "",
  retailer = "",
  sort = "newest",
}: ProductQuery) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return products
    .filter(
      (p) =>
        words.every((w) =>
          `${p.name} ${categories.find((c) => c.slug === p.category)?.name} ${p.merchant}`
            .toLowerCase()
            .includes(w),
        ) &&
        (!category || p.category === category) &&
        (!retailer || p.retailer === retailer),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id),
    );
}
export function safeAffiliateUrl(p: Product, now = Date.now()): string | null {
  if (
    p.isDemo ||
    p.status !== "published" ||
    !p.affiliateApproved ||
    !p.affiliateUrl ||
    !p.lastCheckedAt ||
    !p.expiresAt
  )
    return null;
  const checked = Date.parse(p.lastCheckedAt),
    expires = Date.parse(p.expiresAt);
  if (
    !Number.isFinite(checked) ||
    !Number.isFinite(expires) ||
    checked > now ||
    now - checked > 86400000 ||
    expires <= now
  )
    return null;
  try {
    const url = new URL(p.affiliateUrl);
    const hosts =
      p.retailer === "amazon"
        ? ["amazon.com", "www.amazon.com", "amzn.to"]
        : ["walmart.com", "www.walmart.com"];
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      hosts.includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function displayPrice(p: Product) {
  return !p.isDemo && p.priceVerified && p.currentPrice !== null
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(p.currentPrice)
    : null;
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
