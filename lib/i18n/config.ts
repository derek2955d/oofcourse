export const locales = ["en", "zh"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale =>
  value === "en" || value === "zh";
export const languageTag = (locale: Locale) =>
  locale === "zh" ? "zh-CN" : "en-US";
export function localePath(locale: Locale, path = "/") {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const clean = path.replace(/^\/(en|zh)(?=\/|\?|$)/, "");
  return `/${locale}${clean === "/" ? "" : clean}`;
}
export function switchLocalePath(path: string, query: string, locale: Locale) {
  return `${localePath(locale, path)}${query ? `?${query}` : ""}`;
}
