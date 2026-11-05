// Original outing notes about real places, not live events or operator availability.
export const weekendTypes = [
  "outdoors",
  "waterfront",
  "art",
  "daytrip",
] as const;
export const weekendAreas = ["nyc", "nj", "hudson"] as const;
type Copy = { en: string; zh: string };
export type WeekendPlace = {
  slug: string;
  name: Copy;
  area: (typeof weekendAreas)[number];
  tags: (typeof weekendTypes)[number][];
  location: Copy;
  summary: Copy;
  plan: Copy;
  travel: Copy;
  caution: Copy;
  source: string;
  sourceName: string;
};
export const weekendPlaces: WeekendPlace[] = [
  {
    slug: "governors-island",
    name: { en: "Governors Island", zh: "总督岛" },
    area: "nyc",
    tags: ["waterfront", "outdoors"],
    location: { en: "New York Harbor, NYC", zh: "纽约港，纽约市" },
    summary: {
      en: "Make the harbor your backdrop for an unhurried walk and a picnic break.",
      zh: "坐船换个视角，在纽约港边散步，留一点时间野餐、看风景。",
    },
    plan: {
      en: "Choose a walking loop rather than a packed itinerary. Pack a layer, water and a snack, and leave time to return to the ferry.",
      zh: "选一段步行路线，不把行程排满。带外套、饮水和点心，为返程轮渡留出时间。",
    },
    travel: {
      en: "Plan ferry travel using the island's official visitor information; check the departure point and return sailing before you go.",
      zh: "通过官方游览页面规划轮渡出行，出发前确认码头、航班及返程安排。",
    },
    caution: {
      en: "Ferry arrangements, seasonal facilities and individual attractions may change. Check the current visitor information before committing to a Sunday trip.",
      zh: "轮渡、季节性设施及各项目的开放安排可能变化，周日出发前请核对当日官方信息。",
    },
    source: "https://www.govisland.com/plan-your-visit",
    sourceName: "Governors Island",
  },
  {
    slug: "liberty-state-park",
    name: { en: "Liberty State Park", zh: "自由州立公园" },
    area: "nj",
    tags: ["waterfront", "outdoors"],
    location: { en: "Jersey City, NJ", zh: "泽西市，新泽西" },
    summary: {
      en: "A New Jersey waterfront outing with room for a stroll and harbor views.",
      zh: "去新泽西一侧看纽约港，把周日留给滨水散步。",
    },
    plan: {
      en: "Pick a manageable stretch of waterfront and pause for the view. Bring a windproof layer and make a separate plan for any ticketed attraction.",
      zh: "按体力选一段滨水步道，留时间停下来看看风景。带防风外套；需要门票的项目另行规划。",
    },
    travel: {
      en: "Check the park's official directions. Public transit to Jersey City may still require a local connection or a walk to the park.",
      zh: "参考公园官方交通说明。乘公共交通到泽西市后，仍可能需要换乘或步行前往公园。",
    },
    caution: {
      en: "A park visit is not a Statue of Liberty ferry booking. Check parking, closures and any separate attraction reservations directly.",
      zh: "游览公园不等于已预约自由女神像轮渡。停车、关闭区域及独立景点的预约需分别确认。",
    },
    source:
      "https://www.nj.gov/dep/parksandforests/parks/libertystatepark.html",
    sourceName: "New Jersey State Park Service",
  },
  {
    slug: "met-cloisters",
    name: { en: "The Met Cloisters", zh: "大都会修道院博物馆" },
    area: "nyc",
    tags: ["art"],
    location: { en: "Upper Manhattan, NYC", zh: "纽约曼哈顿北部" },
    summary: {
      en: "Slow down with medieval art and architecture in a different corner of Manhattan.",
      zh: "换个曼哈顿的打开方式，看看中世纪艺术与建筑。",
    },
    plan: {
      en: "Focus on a few galleries instead of trying to see everything. Consider a nearby outdoor walk only if weather and daylight allow.",
      zh: "挑几处感兴趣的展厅慢慢看，不必追求一次逛完。天气与天色合适时，再安排附近散步。",
    },
    travel: {
      en: "Use the museum's official directions and check the current transit route and walking approach.",
      zh: "通过博物馆官方页面查看交通，并核对当天的公共交通路线和步行入口。",
    },
    caution: {
      en: "Check Sunday opening, admission rules, accessibility and any reservation requirements. This guide does not promise free entry or ticket availability.",
      zh: "确认周日开放、入馆规则、无障碍通行与预约要求。这里不承诺免费入场或有余票。",
    },
    source: "https://www.metmuseum.org/plan-your-visit/met-cloisters",
    sourceName: "The Metropolitan Museum of Art",
  },
  {
    slug: "rockaway-beach",
    name: { en: "Rockaway Beach", zh: "洛克威海滩" },
    area: "nyc",
    tags: ["waterfront", "outdoors"],
    location: { en: "Queens, NYC", zh: "纽约皇后区" },
    summary: {
      en: "Trade city blocks for a beachside walk and a change of scenery.",
      zh: "从街区走向海边，散散步、吹吹风，给周末换个背景。",
    },
    plan: {
      en: "Keep the outing simple: a beachside walk and a rest stop. Plan around the weather and available daylight.",
      zh: "把行程安排得简单一些：海边散步，找个地方休息。按天气和日照时间决定停留多久。",
    },
    travel: {
      en: "Check current subway or ferry service, including weekend disruptions and the return trip.",
      zh: "核对当天地铁或轮渡服务，包括周末改线及返程安排。",
    },
    caution: {
      en: "A beach walk does not mean swimming is permitted. Follow posted closures and lifeguard rules; seasonal food and restroom access may vary.",
      zh: "可以到海边散步不代表允许下水。遵守现场关闭及救生员规定，餐饮和卫生间服务也可能有季节变化。",
    },
    source: "https://www.nyctourism.com/attractions-tours/rockaway-beach/",
    sourceName: "NYC Tourism + Conventions",
  },
  {
    slug: "brooklyn-botanic-garden",
    name: { en: "Brooklyn Botanic Garden", zh: "布鲁克林植物园" },
    area: "nyc",
    tags: ["outdoors"],
    location: { en: "Brooklyn, NYC", zh: "纽约布鲁克林" },
    summary: {
      en: "A garden walk for a quieter Sunday, with a different view each season.",
      zh: "想把周日过得慢一点，可以从一次植物园散步开始。",
    },
    plan: {
      en: "Choose a few garden areas and leave time to sit. Dress for the weather and check which indoor spaces are open.",
      zh: "选几处园区慢慢走，给自己留点坐下来休息的时间。按天气穿衣，并确认室内空间是否开放。",
    },
    travel: {
      en: "Use the garden's visitor directions to choose an entrance and check the current transit route.",
      zh: "参考植物园的访客说明选择入口，并核对当天交通路线。",
    },
    caution: {
      en: "Check dated tickets, Sunday hours and garden rules. Flowering dates are weather-dependent; this page does not promise a particular bloom.",
      zh: "确认日期门票、周日开放时间及园区规定。花期受天气影响，本页不保证某种花正在盛开。",
    },
    source: "https://www.bbg.org/visit",
    sourceName: "Brooklyn Botanic Garden",
  },
  {
    slug: "dia-beacon",
    name: { en: "Dia Beacon", zh: "Dia Beacon 艺术馆" },
    area: "hudson",
    tags: ["art", "daytrip"],
    location: {
      en: "Beacon, Hudson Valley, NY",
      zh: "纽约州哈德逊河谷 Beacon",
    },
    summary: {
      en: "Build a day outside the city around a visit to contemporary art in Beacon.",
      zh: "以一次当代艺术参观为主线，给自己安排一天出城的小旅行。",
    },
    plan: {
      en: "Make the museum the main stop and leave room for a break in town. A return travel plan matters more than squeezing in extra stops.",
      zh: "把艺术馆作为主站，给镇上休息留一点余地。先安排好返程，不必硬塞太多景点。",
    },
    travel: {
      en: "Check Metro-North Hudson Line service to Beacon or plan your drive. Confirm the onward route from the station and the last suitable return service.",
      zh: "查看 Metro-North 哈德逊线到 Beacon 的服务，或规划自驾。确认下车后的路线和合适的返程班次。",
    },
    caution: {
      en: "Check Sunday hours, admission and reservations directly with Dia. Allow extra time for regional travel; no travel time or ticket price is guaranteed here.",
      zh: "直接向 Dia 确认周日开放、入场与预约。城际出游留足余量，本页不保证交通时长或票价。",
    },
    source:
      "https://www.diaart.org/visit/visit-our-locations-sites/dia-beacon-beacon-united-states",
    sourceName: "Dia Art Foundation",
  },
];
export function weekendQuery(
  raw: Record<string, string | string[] | undefined>,
): {
  type: (typeof weekendTypes)[number] | "";
  area: (typeof weekendAreas)[number] | "";
} {
  return {
    type: weekendTypes.find((value) => value === raw.type) || "",
    area: weekendAreas.find((value) => value === raw.area) || "",
  };
}
export function filterWeekendPlaces(query: ReturnType<typeof weekendQuery>) {
  return weekendPlaces.filter(
    (place) =>
      (!query.type || place.tags.includes(query.type)) &&
      (!query.area || place.area === query.area),
  );
}
export const getWeekendPlace = (slug: string) =>
  weekendPlaces.find((place) => place.slug === slug);
export const weekendMapUrl = (place: WeekendPlace) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name.en + ", " + place.location.en)}`;
