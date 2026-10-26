// Public geographic reference data, not listings or evidence of local availability.
export const usStates = [
  ["AL", "Alabama", "阿拉巴马"],
  ["AK", "Alaska", "阿拉斯加"],
  ["AZ", "Arizona", "亚利桑那"],
  ["AR", "Arkansas", "阿肯色"],
  ["CA", "California", "加利福尼亚"],
  ["CO", "Colorado", "科罗拉多"],
  ["CT", "Connecticut", "康涅狄格"],
  ["DE", "Delaware", "特拉华"],
  ["DC", "District of Columbia", "哥伦比亚特区"],
  ["FL", "Florida", "佛罗里达"],
  ["GA", "Georgia", "佐治亚"],
  ["HI", "Hawaii", "夏威夷"],
  ["ID", "Idaho", "爱达荷"],
  ["IL", "Illinois", "伊利诺伊"],
  ["IN", "Indiana", "印第安纳"],
  ["IA", "Iowa", "艾奥瓦"],
  ["KS", "Kansas", "堪萨斯"],
  ["KY", "Kentucky", "肯塔基"],
  ["LA", "Louisiana", "路易斯安那"],
  ["ME", "Maine", "缅因"],
  ["MD", "Maryland", "马里兰"],
  ["MA", "Massachusetts", "马萨诸塞"],
  ["MI", "Michigan", "密歇根"],
  ["MN", "Minnesota", "明尼苏达"],
  ["MS", "Mississippi", "密西西比"],
  ["MO", "Missouri", "密苏里"],
  ["MT", "Montana", "蒙大拿"],
  ["NE", "Nebraska", "内布拉斯加"],
  ["NV", "Nevada", "内华达"],
  ["NH", "New Hampshire", "新罕布什尔"],
  ["NJ", "New Jersey", "新泽西"],
  ["NM", "New Mexico", "新墨西哥"],
  ["NY", "New York", "纽约"],
  ["NC", "North Carolina", "北卡罗来纳"],
  ["ND", "North Dakota", "北达科他"],
  ["OH", "Ohio", "俄亥俄"],
  ["OK", "Oklahoma", "俄克拉何马"],
  ["OR", "Oregon", "俄勒冈"],
  ["PA", "Pennsylvania", "宾夕法尼亚"],
  ["RI", "Rhode Island", "罗得岛"],
  ["SC", "South Carolina", "南卡罗来纳"],
  ["SD", "South Dakota", "南达科他"],
  ["TN", "Tennessee", "田纳西"],
  ["TX", "Texas", "得克萨斯"],
  ["UT", "Utah", "犹他"],
  ["VT", "Vermont", "佛蒙特"],
  ["VA", "Virginia", "弗吉尼亚"],
  ["WA", "Washington", "华盛顿"],
  ["WV", "West Virginia", "西弗吉尼亚"],
  ["WI", "Wisconsin", "威斯康星"],
  ["WY", "Wyoming", "怀俄明"],
] as const;
// Consumer rollout. Keep full reference data for future launches and administration.
export const enabledStateCodes: readonly string[] = ["NY", "NJ"];
export const availableStates = enabledStateCodes.map((code) =>
  usStates.find((state) => state[0] === code)!,
);
export function activeState(value: unknown) {
  const code = normalizeState(value);
  return enabledStateCodes.includes(code) ? code : availableStates[0][0];
}
export const stateCookie = "oofcourse_state";
export function normalizeState(value: unknown) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return usStates.some((s) => s[0] === code) ? code : "NY";
}
export function stateLabel(state: string, locale: string) {
  const row = usStates.find((s) => s[0] === normalizeState(state))!;
  return row[locale === "zh" ? 2 : 1];
}
export function cookieState(cookie: string) {
  const value = cookie
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith(stateCookie + "="))
    ?.slice(stateCookie.length + 1);
  return value ? activeState(value) : undefined;
}

export function legacyStateScope(
  areas: readonly { id: string; state: string; city: string }[],
  state: string,
  location = "",
): "empty" | "safe" | "migration-required" {
  const scope = areas.filter((a) => a.state === state);
  if (!scope.length || (location && !scope.some((a) => a.id === location)))
    return "empty";
  if (location && location !== "nyc") return "safe";
  if (
    location === "nyc" &&
    state === "NY" &&
    areas.filter((a) => a.city === "New York").every((a) => a.state === "NY")
  )
    return "safe";
  return areas.every((a) => a.state === state) ? "safe" : "migration-required";
}

// Consumer browse choices; publishing retains detailed location records.
export const nycBoroughIds = [
  "manhattan",
  "brooklyn",
  "queens",
  "bronx",
  "staten-island",
] as const;

export const nearManhattanNJ = [
  ["jersey-city", "Jersey City", "泽西市"],
  ["hoboken", "Hoboken", "霍博肯"],
  ["weehawken", "Weehawken", "威霍肯"],
  ["union-city", "Union City", "联合市"],
  ["west-new-york", "West New York", "西纽约（NJ）"],
] as const;
export function referenceLocationState(id: string) {
  return nearManhattanNJ.some((row) => row[0] === id) ? "NJ" : "NY";
}
