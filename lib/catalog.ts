export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const categoryKeys = [
  "housing",
  "jobs",
  "marketplace",
  "services",
  "businesses",
  "community",
] as const;
export type CategoryKey = (typeof categoryKeys)[number];
export const categoryData = {
  housing: {
    en: "Housing",
    zh: "房屋租售",
    tagEn: "A place to call home",
    tagZh: "找到安心落脚的地方",
    color: "#3478F6",
    background: "#EAF2FF",
    icon: "House",
    subtypes: [
      ["rent", "For rent", "房屋出租"],
      ["sale", "For sale", "房屋出售"],
      ["entire", "Entire place", "整租"],
      ["shared", "Shared housing", "合租"],
      ["room", "Private room", "单间出租"],
      ["short-term", "Short-term", "短期租赁"],
      ["sublet", "Sublet", "转租"],
      ["roommates", "Roommates", "寻找室友"],
      ["commercial", "Commercial", "商业地产"],
      ["parking", "Parking", "车位出租"],
    ],
  },
  jobs: {
    en: "Jobs",
    zh: "招聘求职",
    tagEn: "Your next opportunity",
    tagZh: "发现下一份好机会",
    color: "#0D9488",
    background: "#E5F8F4",
    icon: "BriefcaseBusiness",
    subtypes: [
      ["full-time", "Full-time", "全职工作"],
      ["part-time", "Part-time", "兼职工作"],
      ["internship", "Internships", "实习"],
      ["restaurant", "Food & hospitality", "餐饮招聘"],
      ["driver", "Drivers", "司机招聘"],
      ["warehouse", "Logistics & warehouse", "物流仓库"],
      ["office", "Office", "办公室工作"],
      ["finance", "Accounting & finance", "会计财务"],
      ["sales", "Sales", "销售"],
      ["ecommerce", "E-commerce", "电商"],
      ["seeking", "Seeking work", "求职信息"],
    ],
  },
  marketplace: {
    en: "Marketplace",
    zh: "二手市场",
    tagEn: "Good things, a second life",
    tagZh: "让闲置找到新主人",
    color: "#C47B0B",
    background: "#FFF2DA",
    icon: "Armchair",
    subtypes: [
      ["furniture", "Furniture", "家具"],
      ["phones", "Phones", "手机"],
      ["computers", "Computers", "电脑"],
      ["appliances", "Appliances", "家用电器"],
      ["cars", "Cars", "汽车"],
      ["bikes", "Bicycles", "自行车"],
      ["books", "Books & textbooks", "教材书籍"],
      ["essentials", "Household items", "生活用品"],
      ["free", "Free items", "免费物品"],
      ["other", "Other", "其他闲置"],
    ],
  },
  services: {
    en: "Services",
    zh: "本地服务",
    tagEn: "A little local know-how",
    tagZh: "生活帮手，就在身边",
    color: "#7C3AED",
    background: "#F1EAFF",
    icon: "Wrench",
    subtypes: [
      ["moving", "Moving", "搬家"],
      ["cleaning", "Cleaning", "清洁"],
      ["renovation", "Renovation", "装修"],
      ["repair", "Repairs", "维修"],
      ["airport", "Airport rides", "接机"],
      ["translation", "Translation", "翻译"],
      ["tutoring", "Tutoring", "家教"],
      ["accounting", "Accounting", "会计服务"],
      ["legal", "Legal services", "法律服务"],
      ["family", "Family services", "家庭服务"],
      ["other", "Other services", "其他本地服务"],
    ],
  },
  businesses: {
    en: "Businesses",
    zh: "本地商家",
    tagEn: "Meet your neighborhood",
    tagZh: "发现街角的好店",
    color: "#E36B58",
    background: "#FFE9E5",
    icon: "Store",
    subtypes: [
      ["restaurants", "Restaurants", "餐厅"],
      ["beauty", "Beauty & hair", "美容美发"],
      ["automotive", "Auto services", "汽车服务"],
      ["education", "Education", "教育培训"],
      ["retail", "Retail shops", "零售商店"],
      ["professional", "Professional services", "专业服务"],
      ["other", "Other businesses", "其他商家"],
    ],
  },
  community: {
    en: "Community",
    zh: "社区信息",
    tagEn: "Feel a little more connected",
    tagZh: "连接你我，融入社区",
    color: "#31834B",
    background: "#EAF6EB",
    icon: "UsersRound",
    subtypes: [
      ["events", "Local events", "本地活动"],
      ["announcements", "Announcements", "社区公告"],
      ["carpool", "Carpool", "拼车信息"],
      ["lost-found", "Lost & found", "失物招领"],
      ["experiences", "Local knowledge", "生活经验"],
      ["volunteering", "Volunteering", "公益活动"],
      ["other", "Other community news", "其他社区资讯"],
    ],
  },
} as const;
export function isCategory(v: string): v is CategoryKey {
  return categoryKeys.includes(v as CategoryKey);
}
export function isLocale(v: string): v is Locale {
  return v === "en" || v === "zh";
}
export const locations = [
  ["nyc", "New York City", "纽约市"],
  ["manhattan", "Manhattan", "曼哈顿"],
  ["brooklyn", "Brooklyn", "布鲁克林"],
  ["queens", "Queens", "皇后区"],
  ["bronx", "The Bronx", "布朗克斯"],
  ["staten-island", "Staten Island", "史泰登岛"],
  ["flushing", "Flushing, Queens", "法拉盛，皇后区"],
  ["astoria", "Astoria, Queens", "阿斯托里亚，皇后区"],
  ["sunset-park", "Sunset Park, Brooklyn", "日落公园，布鲁克林"],
  ["morningside-heights", "Morningside Heights", "晨边高地"],
] as const;
export const locationLabel = (slug: string, l: Locale) =>
  locations.find((x) => x[0] === slug)?.[l === "zh" ? 2 : 1] || slug;
export type ListingStatus =
  "draft" | "pending" | "approved" | "rejected" | "expired" | "archived";
export type Listing = {
  id: string;
  user_id: string;
  category: CategoryKey;
  subcategory: string;
  location: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  status: ListingStatus;
  details: Record<string, string | number | boolean | null>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  expires_at: string | null;
  images: { id: string; url: string; position: number; alt: string }[];
  publisher?: string;
  is_sponsored?: boolean;
};
export type BrowseQuery = {
  q: string;
  location: string;
  subcategory: string;
  min: string;
  max: string;
  sort: string;
  page: number;
  bedrooms: string;
  bathrooms: string;
  tenure: string;
  property_type: string;
  furnished: string;
  availability: string;
  employment: string;
  workplace: string;
  pay_period: string;
  condition: string;
  free: string;
  provider_type: string;
  price_type: string;
  event_date: string;
  nearby: string;
  industry: string;
  service_area: string;
  service_type: string;
  topic: string;
};
export const filterKeys = [
  "q",
  "location",
  "subcategory",
  "min",
  "max",
  "sort",
  "bedrooms",
  "bathrooms",
  "tenure",
  "property_type",
  "furnished",
  "availability",
  "employment",
  "workplace",
  "pay_period",
  "condition",
  "free",
  "provider_type",
  "price_type",
  "event_date",
  "nearby",
  "industry",
  "service_area",
  "service_type",
  "topic",
] as const;
export function parseQuery(
  raw: Record<string, string | string[] | undefined>,
): BrowseQuery {
  const q = Object.fromEntries(
    filterKeys.map((k) => [
      k,
      typeof raw[k] === "string" ? raw[k].trim().slice(0, 150) : "",
    ]),
  ) as Omit<BrowseQuery, "page">;
  return {
    ...q,
    location: q.location || "nyc",
    sort: ["newest", "price-low", "price-high"].includes(q.sort)
      ? q.sort
      : "newest",
    page: Math.min(
      1000,
      Math.max(1, Number.parseInt(String(raw.page || "1")) || 1),
    ),
  };
}
export function filterListings(
  items: Listing[],
  q: BrowseQuery,
  now = Date.now(),
) {
  const n = (v: string) =>
    v !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
  return items
    .filter(
      (p) =>
        p.status === "approved" &&
        !!p.expires_at &&
        Date.parse(p.expires_at) > now,
    )
    .filter(
      (p) =>
        !q.q ||
        [
          p.title,
          p.description,
          categoryData[p.category].en,
          categoryData[p.category].zh,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(q.q.toLocaleLowerCase()),
    )
    .filter(
      (p) => !q.location || q.location === "nyc" || p.location === q.location,
    )
    .filter((p) => !q.subcategory || p.subcategory === q.subcategory)
    .filter(
      (p) => n(q.min) === null || (p.price !== null && p.price >= n(q.min)!),
    )
    .filter(
      (p) => n(q.max) === null || (p.price !== null && p.price <= n(q.max)!),
    )
    .filter((p) => q.free !== "1" || p.price === 0)
    .filter((p) =>
      [
        "tenure",
        "property_type",
        "furnished",
        "employment",
        "workplace",
        "pay_period",
        "condition",
        "provider_type",
        "price_type",
      ].every(
        (k) =>
          !q[k as keyof BrowseQuery] ||
          String(p.details[k] ?? "") === q[k as keyof BrowseQuery],
      ),
    )
    .filter((p) =>
      ["nearby", "industry", "service_area", "service_type", "topic"].every(
        (k) =>
          !q[k as keyof BrowseQuery] ||
          String(p.details[k] || "")
            .toLowerCase()
            .includes(String(q[k as keyof BrowseQuery]).toLowerCase()),
      ),
    )
    .filter(
      (p) => !q.bedrooms || Number(p.details.bedrooms) >= Number(q.bedrooms),
    )
    .filter(
      (p) => !q.bathrooms || Number(p.details.bathrooms) >= Number(q.bathrooms),
    )
    .filter(
      (p) =>
        !q.availability ||
        String(p.details.availability || "") <= q.availability,
    )
    .filter(
      (p) =>
        !q.event_date ||
        String(p.details.event_date || "").slice(0, 10) === q.event_date,
    )
    .sort((a, b) =>
      q.sort === "price-low"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : q.sort === "price-high"
          ? (b.price ?? -Infinity) - (a.price ?? -Infinity)
          : String(b.published_at).localeCompare(String(a.published_at)),
    );
}
export function formatMoney(amount: number | null, l: Locale) {
  return amount === null
    ? null
    : new Intl.NumberFormat(l === "zh" ? "zh-CN" : "en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(amount);
}
