import {
  categoryData,
  categoryKeys,
  locations,
  type CategoryKey,
} from "./catalog";
export type Taxonomy = {
  locations: [string, string, string][];
  categories: Record<CategoryKey, { en: string; zh: string }>;
  subtypes: Record<CategoryKey, [string, string, string][]>;
};
export const defaultTaxonomy: Taxonomy = {
  locations: locations.map((x) => [...x]),
  categories: Object.fromEntries(
    categoryKeys.map((c) => [
      c,
      { en: categoryData[c].en, zh: categoryData[c].zh },
    ]),
  ) as Taxonomy["categories"],
  subtypes: Object.fromEntries(
    categoryKeys.map((c) => [c, categoryData[c].subtypes.map((x) => [...x])]),
  ) as Taxonomy["subtypes"],
};
