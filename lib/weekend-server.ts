import "server-only";
import { publicDB, configured } from "./supabase/server";
import { fromRow, attachImages } from "./listings";
import type { Listing } from "./catalog";
import type { weekendQuery } from "./weekend";
export async function weekendSubmissions(
  query: ReturnType<typeof weekendQuery>,
  page = 1,
): Promise<{ items: Listing[]; total: number; error: boolean }> {
  if (!configured()) return { items: [], total: 0, error: false };
  try {
    const db = publicDB();
    let request = db
      .from("listings")
      .select("*", { count: "exact" })
      .eq("category_id", "community")
      .eq("subcategory", "outings")
      .eq("status", "approved")
      .gt("expires_at", new Date().toISOString());
    if (query.type) request = request.eq("details->>outing_type", query.type);
    if (query.area) request = request.eq("details->>outing_area", query.area);
    const { data, error, count } = await request
      .order("published_at", { ascending: false })
      .order("id")
      .range((page - 1) * 12, page * 12 - 1);
    if (error) throw error;
    const items = (data || [])
      .map(fromRow)
      .filter((item): item is Listing => !!item);
    await attachImages(items, db);
    return { items, total: count || 0, error: false };
  } catch {
    return { items: [], total: 0, error: true };
  }
}
