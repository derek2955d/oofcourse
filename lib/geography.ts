// Public geographic reference data, not listings or evidence of local availability.
export const usStates = [
  ["AL", "Alabama", "阿拉巴马州"],
  ["AK", "Alaska", "阿拉斯加州"],
  ["AZ", "Arizona", "亚利桑那州"],
  ["AR", "Arkansas", "阿肯色州"],
  ["CA", "California", "加利福尼亚州"],
  ["CO", "Colorado", "科罗拉多州"],
  ["CT", "Connecticut", "康涅狄格州"],
  ["DE", "Delaware", "特拉华州"],
  ["DC", "District of Columbia", "哥伦比亚特区"],
  ["FL", "Florida", "佛罗里达州"],
  ["GA", "Georgia", "佐治亚州"],
  ["HI", "Hawaii", "夏威夷州"],
  ["ID", "Idaho", "爱达荷州"],
  ["IL", "Illinois", "伊利诺伊州"],
  ["IN", "Indiana", "印第安纳州"],
  ["IA", "Iowa", "艾奥瓦州"],
  ["KS", "Kansas", "堪萨斯州"],
  ["KY", "Kentucky", "肯塔基州"],
  ["LA", "Louisiana", "路易斯安那州"],
  ["ME", "Maine", "缅因州"],
  ["MD", "Maryland", "马里兰州"],
  ["MA", "Massachusetts", "马萨诸塞州"],
  ["MI", "Michigan", "密歇根州"],
  ["MN", "Minnesota", "明尼苏达州"],
  ["MS", "Mississippi", "密西西比州"],
  ["MO", "Missouri", "密苏里州"],
  ["MT", "Montana", "蒙大拿州"],
  ["NE", "Nebraska", "内布拉斯加州"],
  ["NV", "Nevada", "内华达州"],
  ["NH", "New Hampshire", "新罕布什尔州"],
  ["NJ", "New Jersey", "新泽西州"],
  ["NM", "New Mexico", "新墨西哥州"],
  ["NY", "New York", "纽约州"],
  ["NC", "North Carolina", "北卡罗来纳州"],
  ["ND", "North Dakota", "北达科他州"],
  ["OH", "Ohio", "俄亥俄州"],
  ["OK", "Oklahoma", "俄克拉何马州"],
  ["OR", "Oregon", "俄勒冈州"],
  ["PA", "Pennsylvania", "宾夕法尼亚州"],
  ["RI", "Rhode Island", "罗得岛州"],
  ["SC", "South Carolina", "南卡罗来纳州"],
  ["SD", "South Dakota", "南达科他州"],
  ["TN", "Tennessee", "田纳西州"],
  ["TX", "Texas", "得克萨斯州"],
  ["UT", "Utah", "犹他州"],
  ["VT", "Vermont", "佛蒙特州"],
  ["VA", "Virginia", "弗吉尼亚州"],
  ["WA", "Washington", "华盛顿州"],
  ["WV", "West Virginia", "西弗吉尼亚州"],
  ["WI", "Wisconsin", "威斯康星州"],
  ["WY", "Wyoming", "怀俄明州"],
] as const;
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
  return value ? normalizeState(value) : undefined;
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
