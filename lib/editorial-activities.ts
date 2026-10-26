import { newYorkToday } from "./living";

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
      en: "Bryant Park Winter Village opens October 28",
      zh: "Bryant Park 冬季村 10 月 28 日开季",
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
] as const;
export const getEditorialActivity = (slug: string) =>
  editorialActivities.find((activity) => activity.slug === slug);
export function activeEditorialActivities(today = newYorkToday()) {
  return editorialActivities.filter(
    (activity) => activity.checkedAt <= today && today <= activity.day,
  );
}
