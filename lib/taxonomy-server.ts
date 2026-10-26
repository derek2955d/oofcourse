import "server-only";
import { cache } from "react";
import { configured, publicDB } from "./supabase/server";
import { defaultTaxonomy, type Taxonomy } from "./taxonomy";
import { isCategory } from "./catalog";
export const loadTaxonomy = cache(
  async function loadTaxonomy(): Promise<Taxonomy> {
    if (!configured()) return defaultTaxonomy;
    try {
      const db = publicDB();
      const [locations, categories, subtypes] = await Promise.all([
        db
          .from("locations")
          .select("id,name_en,name_zh,state")
          .eq("enabled", true)
          .order("id"),
        db
          .from("categories")
          .select("id,name_en,name_zh")
          .eq("enabled", true)
          .order("sort_order"),
        db
          .from("subcategories")
          .select("id,category_id,name_en,name_zh")
          .order("sort_order"),
      ]);
      if (locations.error || categories.error || subtypes.error)
        return defaultTaxonomy;
      const data: Taxonomy = structuredClone(defaultTaxonomy);
      data.locations = (locations.data || []).map((x) => [
        x.id,
        x.name_en,
        x.name_zh,
      ]);
      data.locationStates = Object.fromEntries(
        (locations.data || []).map((x) => [x.id, x.state]),
      );
      for (const c of categories.data || [])
        if (isCategory(c.id))
          data.categories[c.id] = { en: c.name_en, zh: c.name_zh };
      for (const key of Object.keys(data.subtypes))
        data.subtypes[key as keyof typeof data.subtypes] = (subtypes.data || [])
          .filter((x) => x.category_id === key)
          .map((x) => [x.id, x.name_en, x.name_zh]);
      return data;
    } catch {
      return defaultTaxonomy;
    }
  },
);
