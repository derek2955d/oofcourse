export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};
export const categories: Category[] = [
  {
    slug: "tech",
    name: "Tech & Electronics",
    description: "Small upgrades. Smarter everyday.",
    icon: "⌘",
  },
  {
    slug: "home",
    name: "Home & Kitchen",
    description: "Make yourself right at home.",
    icon: "⌂",
  },
  {
    slug: "outdoors",
    name: "Outdoors & Travel",
    description: "Good things for getting out.",
    icon: "✧",
  },
  {
    slug: "wellness",
    name: "Health & Wellness",
    description: "A little more you time.",
    icon: "✳",
  },
];
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  merchant: string;
  imageUrl: string;
  affiliateUrl: string | null;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  status: "demo" | "active" | "expired";
  createdAt: string;
  expiresAt: string;
  lastCheckedAt: string;
  featured: boolean;
  trending: boolean;
  color: string;
  kind: string;
};
const items = [
  ["Studio Wireless Headphones", "tech", 59.99, 99.99, "headphones", "#e8e8dc"],
  ["Everyday Pour-Over Set", "home", 24.99, 39.99, "coffee", "#e9d9c6"],
  ["Trailside Daypack · 22L", "outdoors", 34.99, 59.99, "backpack", "#dce6d6"],
  ["Ambient Desk Lamp", "home", 29.99, 49.99, "lamp", "#e9dfcf"],
  ["Pocket Bluetooth Speaker", "tech", 22.99, 39.99, "speaker", "#dce4eb"],
  ["Cloud Yoga Mat", "wellness", 19.99, 34.99, "mat", "#e4dce9"],
  ["Everyday Insulated Tumbler", "outdoors", 16.99, 27.99, "bottle", "#d9e3de"],
  ["Minimal Wireless Keyboard", "tech", 39.99, 64.99, "keyboard", "#e6e5e1"],
  ["Sunday Ceramic Mug Set", "home", 18.99, 29.99, "mugs", "#e9d9d2"],
  ["Go-Anywhere Packing Cubes", "outdoors", 21.99, 34.99, "cubes", "#dbe2e8"],
  ["Recovery Massage Roller", "wellness", 14.99, 24.99, "roller", "#e6dfd4"],
  ["Compact Charging Stand", "tech", 27.99, 44.99, "charger", "#dbe4dd"],
] as const;
export const products: Product[] = items.map(
  ([name, category, price, original, kind, color], i) => ({
    id: `demo-${i + 1}`,
    name,
    slug: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-$/, ""),
    description: `A thoughtfully chosen ${name.toLowerCase()} for your everyday routine. This original concept is a demonstration listing, not an actual merchant product or offer. Prices, savings, and availability shown are fictional examples for testing the site.`,
    category,
    merchant: "Demo merchant",
    imageUrl: `/illustrations/${kind}.svg`,
    affiliateUrl: null,
    currentPrice: price,
    originalPrice: original,
    discountPercentage: Math.round((1 - price / original) * 100),
    status: i === 11 ? "expired" : "demo",
    createdAt: `2026-10-${String(15 + Math.floor(i / 2)).padStart(2, "0")}T12:00:00Z`,
    expiresAt: "2026-11-01T00:00:00Z",
    lastCheckedAt: "2026-10-20T12:00:00Z",
    featured: i < 4,
    trending: i >= 4 && i < 8,
    color,
    kind,
  }),
);
export function selectProducts({
  q = "",
  category = "",
  sort = "newest",
}: {
  q?: string;
  category?: string;
  sort?: string;
}) {
  const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return products
    .filter(
      (p) =>
        words.every((w) =>
          `${p.name} ${p.description} ${categories.find((c) => c.slug === p.category)?.name}`
            .toLowerCase()
            .includes(w),
        ) &&
        (!category || p.category === category),
    )
    .sort((a, b) =>
      sort === "price-asc"
        ? a.currentPrice - b.currentPrice
        : sort === "price-desc"
          ? b.currentPrice - a.currentPrice
          : sort === "savings"
            ? b.discountPercentage - a.discountPercentage
            : b.createdAt.localeCompare(a.createdAt),
    );
}
export function safeAffiliateUrl(p: Product, now = Date.now()): string | null {
  if (
    p.status !== "active" ||
    !p.affiliateUrl ||
    !Number.isFinite(Date.parse(p.expiresAt)) ||
    Date.parse(p.expiresAt) <= now
  )
    return null;
  try {
    const url = new URL(p.affiliateUrl);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      ["amazon.com", "www.amazon.com", "amzn.to"].includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
} // A future live-data adapter must verify affiliate enrollment and merchant data before setting active status.
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
