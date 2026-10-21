export type Query = {
  q?: string;
  category?: string;
  retailer?: string;
  sort?: string;
  saved?: string;
};
export function normalizeQuery(
  raw: Record<string, string | string[] | undefined>,
): Query {
  const value = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string).slice(0, 200) : "";
  return {
    q: value("q"),
    category: value("category"),
    retailer: value("retailer"),
    sort: value("sort") === "name" ? "name" : "newest",
    saved: value("saved") === "1" ? "1" : "",
  };
}
