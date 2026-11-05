import type { Locale } from "./catalog";

type Copy = { en: string; zh: string };
export type LivingGuide = {
  slug: string;
  topic: "housing" | "marketplace" | "community";
  title: Copy;
  summary: Copy;
  tag: Copy;
  updatedAt: string;
  sections: { title: Copy; points: Copy[] }[];
  sources: { name: string; url: string }[];
};

// Original editorial checklists, not user listings or retailer/event feeds.
export const livingGuides: LivingGuide[] = [
  {
    slug: "rental-viewing-checklist",
    topic: "housing",
    updatedAt: "2026-10-26",
    title: {
      en: "Before you say yes to a place",
      zh: "看房之前，先带上这份核查清单",
    },
    summary: {
      en: "A practical checklist for the viewing, the commute and the questions to ask before paying or signing.",
      zh: "从预算、通勤到费用和合同，把重要的问题问清楚，再决定是否付款或签约。",
    },
    tag: { en: "Housing checklist", zh: "租房清单" },
    sections: [
      {
        title: {
          en: "Plan the full cost and the commute",
          zh: "先算清总支出，再看看通勤",
        },
        points: [
          {
            en: "Write down the advertised rent, utilities, deposit and every proposed fee. Ask who receives each payment, what it covers and whether it is refundable; get the explanation in writing.",
            zh: "列出租金、水电网费、押金及对方提出的每项费用。问清收款方、用途及是否可退，并保留书面说明。",
          },
          {
            en: "Check the actual trip to work or school, including transfers and late-night travel. Use MTA's current fare and service information rather than a travel time in an advertisement.",
            zh: "核对到公司或学校的实际路线，包括换乘和晚间出行。票价与运行信息以 MTA 最新说明为准，不只依赖广告上的通勤时间。",
          },
        ],
      },
      {
        title: {
          en: "Check the place and the person offering it",
          zh: "核查房屋，也核查出租方",
        },
        points: [
          {
            en: "Arrange a viewing where possible. Ask about heating, water, locks, pests, repairs, shared areas and exactly what is included. Record issues with permission.",
            zh: "条件允许时实地看房，询问供暖、用水、门锁、虫害、维修、共用空间及包含的设施；记录问题或拍照前先征得同意。",
          },
          {
            en: "Ask the advertiser to explain their authority to rent the space. A platform account or an attractive photograph is not proof of ownership or authorization.",
            zh: "请发布者说明其出租或转租权限。平台注册账号或漂亮的照片，并不能证明房屋所有权或合法授权。",
          },
        ],
      },
      {
        title: {
          en: "Pause before sending money or documents",
          zh: "付款和提交资料前，再确认一次",
        },
        points: [
          {
            en: "Read the written terms, confirm the parties and keep receipts. If a fee or a lease condition is unclear, consult NYC HPD's tenant resources or qualified help before agreeing.",
            zh: "阅读书面条款、核对签约主体并保留收据。遇到不清楚的费用或租赁条件，先查阅纽约市 HPD 租客资源，必要时寻求专业帮助。",
          },
          {
            en: "Do not post identification documents or financial records publicly. Be cautious about pressure to pay immediately or to use gift cards, cryptocurrency or an unverified payment destination.",
            zh: "不要在公开信息中上传身份证件或财务资料。对催促立即付款、要求礼品卡或加密货币付款、收款对象无法核实等情况保持警惕。",
          },
        ],
      },
    ],
    sources: [
      {
        name: "NYC HPD — Tenant Rights and Responsibilities",
        url: "https://www.nyc.gov/site/hpd/services-and-information/tenants-rights-and-responsibilities.page",
      },
      {
        name: "MTA — Subway and bus fares",
        url: "https://www.mta.info/fares-tolls/subway-bus",
      },
    ],
  },
  {
    slug: "secondhand-pickup-checklist",
    topic: "marketplace",
    updatedAt: "2026-10-26",
    title: {
      en: "A better secondhand handoff",
      zh: "二手交易，约见前先确认这些事",
    },
    summary: {
      en: "Condition, pickup and payment: agree on the details before you make the trip.",
      zh: "成色、取货方式和付款安排提前说清，让一次闲置交易少一点麻烦。",
    },
    tag: { en: "Secondhand essentials", zh: "二手交易" },
    sections: [
      {
        title: {
          en: "Ask about the actual item",
          zh: "先确认是不是你需要的东西",
        },
        points: [
          {
            en: "Ask for the model, dimensions, condition and known defects. For electronics, agree on a reasonable way to test the item before completing the exchange.",
            zh: "问清型号、尺寸、成色及已知故障。购买电子产品时，提前约定合理的现场测试方式。",
          },
          {
            en: "Confirm what is included: accessories, cables, packaging or assembly parts. Work out transportation and lifting arrangements for larger items in advance.",
            zh: "确认是否包含配件、电源线、包装或组装零件。大件物品要提前安排运输与搬运，不要到现场才发现拿不走。",
          },
        ],
      },
      {
        title: {
          en: "Make a considerate pickup plan",
          zh: "约定清楚、安全的交接方式",
        },
        points: [
          {
            en: "Where practical, choose a well-lit public place and tell someone your plan. If home pickup is necessary for furniture, share the exact address privately only after agreeing on the arrangement.",
            zh: "条件允许时，选择明亮、公开的地点，并告知可信的人你的行程。家具等必须上门取货时，先约定安排，再私下提供具体地址。",
          },
          {
            en: "Do not publish a home address, door code or personal documents in the listing. Respect the other person's privacy, and leave if the arrangement feels unsafe.",
            zh: "不要在公开信息中发布住址、门禁密码或个人证件。尊重对方隐私；如果交接安排让你感到不安全，可以停止交易。",
          },
        ],
      },
      {
        title: {
          en: "Check the payment yourself",
          zh: "自己核实付款，不只看截图",
        },
        points: [
          {
            en: "Agree on the amount and method before meeting. Check the transaction in your own payment provider's app; a screenshot or an email supplied by the other person is not payment confirmation.",
            zh: "见面前确认金额和支付方式。通过自己的支付平台核实交易状态，不把对方提供的截图或邮件当成到账证明。",
          },
          {
            en: "Do not share login or verification codes, send money to unlock a payment, or refund an unexplained overpayment. Review any buyer/seller protections directly with the payment provider.",
            zh: "不要透露登录或验证码，不要为“解冻款项”转账，也不要退还来历不明的多付款。买卖双方保护范围应直接向支付平台核实。",
          },
        ],
      },
    ],
    sources: [
      {
        name: "FTC Consumer Advice — Online Shopping",
        url: "https://consumer.ftc.gov/articles/online-shopping",
      },
    ],
  },
  {
    slug: "libraries-and-local-activities",
    topic: "community",
    updatedAt: "2026-10-26",
    title: {
      en: "Make your library part of local life",
      zh: "从图书馆开始，发现身边的活动",
    },
    summary: {
      en: "Find a branch, check card requirements and discover classes, talks and neighborhood events through official calendars.",
      zh: "找一家方便到达的分馆，了解借书证申请要求，再从官方日历发现课程、讲座和社区活动。",
    },
    tag: { en: "Local life", zh: "生活指南" },
    sections: [
      {
        title: {
          en: "Start with the official library website",
          zh: "先找到适合自己的图书馆",
        },
        points: [
          {
            en: "Use the official New York Public Library, Brooklyn Public Library or Queens Public Library website to find a convenient branch and its current hours.",
            zh: "通过纽约公共图书馆、布鲁克林公共图书馆或皇后区公共图书馆的官方网站，查找方便到达的分馆及当前开放时间。",
          },
          {
            en: "Before applying for a library card, check the system's current eligibility, identification and address-document requirements. Do not assume the same rules apply to every library system.",
            zh: "申请借书证前，核对所属图书馆系统最新的资格、身份证明与地址材料要求，不要假定所有系统的规定完全相同。",
          },
        ],
      },
      {
        title: {
          en: "Find something that fits your day",
          zh: "按时间、地点和兴趣找活动",
        },
        points: [
          {
            en: "Use calendar filters for the date, branch, age group and activity type. Look for language classes, talks, family programs or other activities that suit your interests.",
            zh: "在活动日历中按日期、分馆、年龄与活动类型查找，留意适合自己的语言学习、讲座、家庭或其他兴趣活动。",
          },
          {
            en: "Read the individual event page for registration, capacity, accessibility and cost information. A calendar entry does not guarantee a place or imply that the activity is free.",
            zh: "进入具体活动页面，查看预约、名额、无障碍安排和费用说明。日历中有活动，并不等于一定有名额，也不代表活动免费。",
          },
        ],
      },
      {
        title: {
          en: "Check once more before heading out",
          zh: "出门前再看一次主办方通知",
        },
        points: [
          {
            en: "Recheck the location, start time and any cancellation notice. For outdoor activities, review the organizer's weather policy and transportation options.",
            zh: "出发前再次核对地点、开始时间及取消通知。户外活动还应查看主办方的天气安排，并提前规划交通。",
          },
          {
            en: "OofCourse links you to the organizer; it does not handle registration or promise availability. Complete reservations only through a channel you have verified.",
            zh: "OofCourse 提供主办方查询入口，不代办预约，也不保证名额。请通过自己核实过的渠道完成报名。",
          },
        ],
      },
    ],
    sources: [
      {
        name: "NYPL — Get a Library Card",
        url: "https://www.nypl.org/library-card",
      },
      {
        name: "Brooklyn Public Library — Events",
        url: "https://discover.bklynlibrary.org/?event=true",
      },
      {
        name: "Queens Public Library — Calendar",
        url: "https://www.queenslibrary.org/calendar",
      },
    ],
  },
];

export const officialCalendars = [
  {
    id: "nypl",
    name: { en: "New York Public Library", zh: "纽约公共图书馆" },
    description: {
      en: "Browse the library's official event calendar.",
      zh: "查找图书馆主办的讲座、课程和社区活动。",
    },
    url: "https://www.nypl.org/events/calendar",
  },
  {
    id: "brooklyn",
    name: { en: "Brooklyn Public Library", zh: "布鲁克林公共图书馆" },
    description: {
      en: "Explore programs through the official event search.",
      zh: "通过官方活动搜索，了解分馆项目与活动。",
    },
    url: "https://discover.bklynlibrary.org/?event=true",
  },
  {
    id: "queens",
    name: { en: "Queens Public Library", zh: "皇后区公共图书馆" },
    description: {
      en: "Find events on the library's official calendar.",
      zh: "在官方日历查看皇后区图书馆的活动安排。",
    },
    url: "https://www.queenslibrary.org/calendar",
  },
  {
    id: "parks",
    name: { en: "NYC Parks", zh: "纽约市公园局" },
    description: {
      en: "Check the official calendar for park activities.",
      zh: "通过官方日历查找公园与户外活动。",
    },
    url: "https://www.nycgovparks.org/events",
  },
];
export const getLivingGuide = (slug: string) =>
  livingGuides.find((guide) => guide.slug === slug);
export function eventDay(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : null;
}
export function newYorkToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => parts.find((p) => p.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function guideCopy(guide: LivingGuide, locale: Locale) {
  return { title: guide.title[locale], summary: guide.summary[locale] };
}

// Add calendar days to a New York date without DST changing the date boundary.
export function eventHorizon(today: string, days: number) {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
