import { sourcedActivities } from "./sourced-activities";
import { newYorkToday, eventHorizon } from "./living";

// Source-controlled editorial facts, not member listings or organizer-authorized copy.
export const editorialActivities = [
  {
    slug: "bryant-park-winter-village-opening-2026",
    checkedAt: "2026-10-26",
    day: "2026-10-28",
    startsAt: "2026-10-28T12:00:00-04:00",
    source: "Bryant Park",
    sourceUrl:
      "https://bryantpark.org/activities/bank-of-america-winter-village-at-bryant-park",
    title: {
      en: "Bryant Park Winter Village opening",
      zh: "Bryant Park 冬季村开季",
    },
    summary: {
      en: "The official website announces a noon opening with skating, holiday shops and food options in Manhattan.",
      zh: "官网公布，冬季村将于中午 12 点开放，现场包括滑冰场、节日商铺和餐饮区域。",
    },
    place: { en: "Bryant Park, Manhattan", zh: "曼哈顿 Bryant Park" },
    fees: {
      en: "Some options cost extra. Standard skating with your own skates can be free, but advance reservations are required. Check the official booking flow for prices and availability.",
      zh: "这不是一项全部免费的活动。自带冰鞋的普通滑冰入场可免费，但需提前预约；租鞋和部分其他项目另收费，价格与名额请在官网确认。",
    },
    seasonNote: {
      en: "The rink separately lists October 28, 2026–February 28, 2027. This is not a confirmed end date for the holiday shops or every Winter Village attraction.",
      zh: "官网另列出的滑冰场运营期为 2026 年 10 月 28 日至 2027 年 2 月 28 日，不代表节日商铺或全部项目也按相同日期开放。",
    },
  },
  {
    slug: "village-halloween-parade-2026",
    checkedAt: "2026-10-29",
    day: "2026-10-31",
    startsAt: "2026-10-31",
    source: "NYC Tourism + Conventions",
    sourceUrl: "https://www.nyctourism.com/events/village-halloween-parade/",
    title: {
      en: "Village Halloween Parade",
      zh: "格林威治村万圣节游行",
    },
    summary: {
      en: "NYC Tourism lists the 2026 Halloween parade in Greenwich Village, with a route along Sixth Avenue.",
      zh: "纽约市旅游机构列出今年格林威治村万圣节游行，将沿第六大道展开。",
    },
    place: {
      en: "Greenwich Village, Manhattan · Sixth Avenue",
      zh: "曼哈顿格林威治村 · 第六大道",
    },
    fees: {
      en: "Check the organizer's current participation, viewing and reservation rules. No ticket price or availability is confirmed here.",
      zh: "参与、观看及预约规则请核对主办方最新说明。本页不确认票价或余位。",
    },
    seasonNote: {
      en: "The source lists October 31, 2026. Exact start time, route access and any changes should be checked before leaving; no start time is asserted here.",
      zh: "来源列明活动日期为 2026 年 10 月 31 日。出发前确认准确开始时间、路线入口及临时变更；本页不编写未经核实的具体时刻。",
    },
  },
  {
    slug: "queens-film-arts-festival-2026",
    checkedAt: "2026-10-29",
    day: "2026-11-14",
    startsAt: "2026-11-13",
    source: "NYC Tourism + Conventions",
    sourceUrl: "https://www.nyctourism.com/events/queens-world-film-arts-fest/",
    title: {
      en: "Queens World First Amendment Film & Arts Festival",
      zh: "Queens World 第一修正案电影与艺术节",
    },
    summary: {
      en: "A two-day film and arts festival listed in the Kaufman Astoria Arts District, with screenings, performances and conversation.",
      zh: "纽约市旅游机构列出的两日电影与艺术活动，地点位于 Kaufman Astoria 艺术区，包含放映、表演与交流。",
    },
    place: {
      en: "Kaufman Astoria Arts District, Queens",
      zh: "皇后区 Kaufman Astoria 艺术区",
    },
    fees: {
      en: "Check the organizer's registration and admission details for each program. This note does not promise free entry or remaining tickets.",
      zh: "各场次的报名和入场规则请查主办方详情，本条不承诺免费入场或仍有余票。",
    },
    seasonNote: {
      en: "The source lists November 13–14, 2026. Individual venues and times may differ by program; confirm the specific session before making plans.",
      zh: "来源列明日期为 2026 年 11 月 13–14 日。不同场次可能有不同地址和时刻，出发前请确认具体安排。",
    },
  },
  ...sourcedActivities,
] as const;
export const getEditorialActivity = (slug: string) =>
  editorialActivities.find((activity) => activity.slug === slug);
export type EditorialActivity = (typeof editorialActivities)[number];
function monthBoundary(today: string, offset: number) {
  const date = new Date(`${today}T12:00:00Z`);
  const end = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset + 1, 0),
  );
  return new Date(
    Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      Math.min(date.getUTCDate(), end.getUTCDate()),
      12,
    ),
  )
    .toISOString()
    .slice(0, 10);
}
export function archivedEditorialActivities(today = newYorkToday()) {
  const since = monthBoundary(today, -3);
  return editorialActivities
    .filter((a) => a.day < today && a.day >= since && a.checkedAt <= today)
    .sort((a, b) => b.day.localeCompare(a.day));
}
export function activeEditorialActivities(today = newYorkToday()) {
  const until = monthBoundary(today, 1);
  return editorialActivities
    .filter(
      (activity) =>
        activity.checkedAt <= today &&
        today <= activity.day &&
        activity.startsAt.slice(0, 10) <= until,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

// The homepage is for plans that can happen soon; larger event browsing stays monthly.
export function homepageEditorialActivities(today = newYorkToday()) {
  const until = eventHorizon(today, 14);
  return activeEditorialActivities(today).filter(
    (activity) => activity.startsAt.slice(0, 10) <= until,
  );
}

// One browsing list: upcoming entries first, followed by recent source records.
export function recentEditorialActivities(today = newYorkToday()) {
  return [
    ...activeEditorialActivities(today),
    ...archivedEditorialActivities(today),
  ];
}

// Date-only sources must not accidentally acquire midnight UTC or a made-up time.
export function activityDateValue(value: string) {
  return new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
}
