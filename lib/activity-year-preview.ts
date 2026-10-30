import { newYorkToday } from "./living";
type Copy = { en: string; zh: string };
const themes: { title: Copy; intro: Copy; body: Copy; image: string }[] = [
  {
    title: { zh: "河畔的慢节奏周末", en: "A slower weekend by the waterfront" },
    intro: {
      zh: "把沿河散步、拍照和找一家小店休息，组合成一份轻松的出门灵感。",
      en: "A relaxed outing idea pairing a waterfront walk, a few photos and a neighborhood café break.",
    },
    body: {
      zh: "出门不一定要安排很多项目。可以从一段沿河的散步开始，把看风景、拍照和休息串成一个轻松的下午。和朋友同行时，不妨少赶一个地点，多留一点聊天的时间；独自出门也可以带一本书，找个合适的位置坐一会儿。这份出游灵感适合慢节奏的一天，具体路线仍需根据天气与公共空间开放情况决定。",
      en: "An outing does not need a packed itinerary. A waterfront walk, time for a few photographs and a quiet break can make a satisfying afternoon. With friends, leave room for conversation instead of adding another stop. On your own, bring a book and enjoy a change of scenery. This is an idea for a slower day; choose an actual route after checking weather and public access.",
    },
    image: "city",
  },
  {
    title: { zh: "和朋友看一场电影", en: "A film night with friends" },
    intro: {
      zh: "从一场放映开始，给朋友之间的聊天留一点时间。",
      en: "An outing concept built around a screening and time to catch up afterward.",
    },
    body: {
      zh: "看电影的乐趣不只在银幕上，也在散场以后。挑一个大家都感兴趣的主题，给映后聊天留一点时间，聊聊最喜欢的镜头，或者故事里没有说完的部分。不必把每个周末都安排得热闹，一场电影和一段交谈也可以是很好的放松方式。这个样例只提供出门灵感，没有对应已确认的影片或放映场次。",
      en: "Part of the pleasure of a film is the conversation afterward. Choose a theme everyone finds interesting and leave time to talk about a favorite shot or an unanswered question in the story. Not every weekend needs a busy itinerary: a film and a conversation can be enough. This concept offers inspiration rather than a confirmed screening or film program.",
    },
    image: "cinema",
  },
  {
    title: { zh: "留半天给艺术和展览", en: "An afternoon for art" },
    intro: {
      zh: "慢慢看作品，不赶场，把半天留给自己喜欢的展览。",
      en: "A quiet editorial idea about taking time with art rather than rushing between venues.",
    },
    body: {
      zh: "不用一次看完所有作品，也不一定要先懂很多艺术知识。可以只挑一个主题，慢慢看让自己停下脚步的作品，注意色彩、材料，或者它带来的联想。留半天给展览，再留一点空白给自己，会比匆忙打卡更轻松。这是一个艺术出游的内容概念，并未指定实际展览或入场安排。",
      en: "You do not have to see every work or arrive with expert knowledge. Pick a theme and spend time with the pieces that catch your attention: a color, a material or an unexpected association. Leave half a day for art and a little space around it rather than rushing through a checklist. This is an outing concept, with no particular exhibition or admission arrangement confirmed.",
    },
    image: "city",
  },
  {
    title: { zh: "发现街区里的小惊喜", en: "A neighborhood worth wandering" },
    intro: {
      zh: "沿着熟悉的街道换条路线，发现小店、街景和生活里的新鲜感。",
      en: "An idea for seeing familiar streets differently, with small shops and everyday city scenes.",
    },
    body: {
      zh: "同一条路，换个时间走，也可能有不同的感觉。可以从熟悉的街口转向平时很少经过的方向，看看建筑、橱窗和街边的小细节。走累了就停下来休息，不必为了完成路线而赶路。这个街区探索概念不指定商家，也没有商业合作或集会安排，重点只是给日常生活留一点发现的空间。",
      en: "A familiar street can feel different at another time of day. Turn toward a block you usually pass by and notice the buildings, windows and small details along the way. Stop when you need a break rather than hurrying to complete a route. This neighborhood concept names no merchant and includes no partnership or gathering; the idea is simply to make space for discovery in everyday life.",
    },
    image: "city",
  },
];
const archiveTitles: Copy[] = [
  { zh: "深秋河边的一小时", en: "An hour by the river in late fall" },
  { zh: "天冷了，约朋友看电影", en: "A movie plan for colder evenings" },
  { zh: "冬日里的艺术下午", en: "A winter afternoon with art" },
  { zh: "街区里的冬季散步", en: "A winter neighborhood stroll" },
  { zh: "新年第一份河畔灵感", en: "A riverside idea for the new year" },
  { zh: "给周末留一场电影", en: "Leave room for a weekend film" },
  { zh: "用展览点亮冬日", en: "Brighten a winter day with art" },
  { zh: "发现家附近的新路线", en: "A new route close to home" },
  { zh: "春天，从水边开始", en: "Let spring start by the water" },
  { zh: "春日电影之约", en: "A spring film outing" },
  { zh: "慢慢看一场春季展览", en: "Taking time with art in spring" },
  { zh: "换个街区过周末", en: "Spend a weekend in a new neighborhood" },
  { zh: "初夏的河岸时光", en: "Early summer by the waterfront" },
  { zh: "夏夜电影聊天计划", en: "A summer film-and-conversation idea" },
  { zh: "城市里的夏日艺术灵感", en: "Summer art inspiration in the city" },
  { zh: "街头散步，不赶时间", en: "A neighborhood walk without a rush" },
  { zh: "把傍晚留给河风", en: "An evening for the river breeze" },
  { zh: "炎热周末的电影灵感", en: "A film idea for a warm weekend" },
  { zh: "夏末，给艺术留一点时间", en: "Make time for art in late summer" },
  {
    zh: "街区里的夏末小发现",
    en: "Small neighborhood discoveries in late summer",
  },
  { zh: "初秋河畔，慢一点走", en: "A slower waterfront walk in early fall" },
  { zh: "秋天的第一场电影之约", en: "A first film outing for fall" },
  { zh: "秋日艺术半日灵感", en: "An autumn afternoon of art" },
  { zh: "重新认识熟悉的街区", en: "Rediscover a familiar neighborhood" },
];
export type ActivityYearSample = {
  slug: string;
  day: string;
  period: "archive" | "upcoming";
  title: Copy;
  intro: Copy;
  body: Copy;
  image: string;
};
function day(value: Date) {
  return value.toISOString().slice(0, 10);
}
export function activityYearSamples(
  today = newYorkToday(),
): ActivityYearSample[] {
  const now = new Date(`${today}T12:00:00Z`);
  const items: ActivityYearSample[] = [];
  // Two original content concepts for each of twelve calendar months, never backdated publications.
  for (let offset = 11; offset >= 0; offset--)
    for (const n of [0, 1]) {
      const date = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth() - offset,
          5 + n * 10,
          12,
        ),
      );
      if (day(date) >= today) date.setTime(now.getTime() - 86400000 * (n + 1));
      const theme = themes[((11 - offset) * 2 + n) % themes.length];
      items.push({
        ...theme,
        title: archiveTitles[(11 - offset) * 2 + n],
        slug: `archive-${day(date)}-${n}`,
        day: day(date),
        period: "archive",
      });
    }
  for (const [i, delta] of [3, 7, 10, 14, 17, 21, 24, 28].entries()) {
    const date = new Date(now.getTime() + delta * 86400000);
    const theme = themes[i % themes.length];
    items.push({
      ...theme,
      title: {
        zh: `${theme.title.zh} · ${i < 4 ? "月初灵感" : "月末灵感"}`,
        en: `${theme.title.en} · ${i < 4 ? "Early-month idea" : "Late-month idea"}`,
      },
      slug: `upcoming-${day(date)}`,
      day: day(date),
      period: "upcoming",
    });
  }
  return items;
}
