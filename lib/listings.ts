import "server-only";
import { legacyStateScope, njNearbyGroup } from "./geography";
import { enabledAreas, selectedState } from "./geography-server";
import { configured, publicDB } from "./supabase/server";
import {
  isCategory,
  type Listing,
  type CategoryKey,
  type BrowseQuery,
} from "./catalog";
export type ListingResult = {
  items: Listing[];
  total: number;
  error: boolean;
  configured: boolean;
};
export function fromRow(raw: Record<string, unknown>): Listing | null {
  if (!isCategory(String(raw.category_id))) return null;
  return {
    id: String(raw.id),
    user_id: String(raw.user_id),
    category: raw.category_id as CategoryKey,
    subcategory: String(raw.subcategory),
    location: String(raw.location_id),
    state: typeof raw.state === "string" ? raw.state : undefined,
    title: String(raw.title),
    description: String(raw.description),
    price: raw.price === null ? null : Number(raw.price),
    currency: String(raw.currency || "USD"),
    status: raw.status as Listing["status"],
    details: (raw.details || {}) as Listing["details"],
    created_at: String(raw.created_at),
    updated_at: String(raw.updated_at),
    published_at: raw.published_at ? String(raw.published_at) : null,
    expires_at: raw.expires_at ? String(raw.expires_at) : null,
    images: [],
    publisher: typeof raw.publisher === "string" ? raw.publisher : undefined,
  };
}
export async function browseListings(
  category: CategoryKey | undefined,
  query: Partial<BrowseQuery> = {},
  take = 12,
): Promise<ListingResult> {
  if (!configured())
    return { items: [], total: 0, error: false, configured: false };
  try {
    const db = publicDB();
    const state = await selectedState(query.state);
    const args = {
      p_category: category || null,
      p_filters: { ...query, state },
      p_limit: take,
      p_offset: ((query.page || 1) - 1) * take,
    };
    const groupedNJ = query.location === njNearbyGroup;
    let { data, error } = await db.rpc(
      groupedNJ ? "search_listings_by_region" : "search_listings_by_state",
      args,
    );
    if (error?.code === "PGRST202" && !groupedNJ) {
      // Safe compatibility with the existing NY-only database until migration 007.
      // Never post-filter a paginated result or silently show another state's rows.
      const compatibility = legacyStateScope(
        await enabledAreas(),
        state,
        query.location,
      );
      if (compatibility === "empty")
        return { items: [], total: 0, error: false, configured: true };
      if (compatibility !== "safe")
        throw new Error("State search migration required");
      ({ data, error } = await db.rpc("search_listings", args));
    }
    if (error) throw error;
    const payload = data as { items: Record<string, unknown>[]; total: number };
    const items = (payload.items || [])
      .map((row) => ({ ...row, state: row.state || state }))
      .map(fromRow)
      .filter((p): p is Listing => !!p);
    await attachImages(items, db);
    return {
      items,
      total: Number(payload.total || 0),
      error: false,
      configured: true,
    };
  } catch {
    return { items: [], total: 0, error: true, configured: true };
  }
}
export async function getPublicListing(
  category: CategoryKey,
  id: string,
): Promise<{ item: Listing | null; error: boolean }> {
  if (!configured() || !/^[0-9a-f-]{36}$/i.test(id))
    return { item: null, error: false };
  try {
    const db = publicDB();
    const { data, error } = await db
      .from("listings")
      .select("*")
      .eq("id", id)
      .eq("category_id", category)
      .maybeSingle();
    if (error) throw error;
    const item = data ? fromRow(data) : null;
    if (item) {
      await attachImages([item], db);
      const { data: profile } = await db
        .from("profiles")
        .select("display_name,bio")
        .eq("id", item.user_id)
        .maybeSingle();
      if (profile) item.publisher = profile.display_name;
    }
    return { item, error: false };
  } catch {
    return { item: null, error: true };
  }
}
export async function attachImages(
  items: Listing[],
  db: ReturnType<typeof publicDB>,
) {
  if (!items.length) return;
  const { data, error } = await db
    .from("listing_media")
    .select("id,listing_id,object_path,position,alt")
    .in(
      "listing_id",
      items.map((p) => p.id),
    )
    .order("position");
  if (error) throw error;
  if (!data?.length) return;
  const { data: urls, error: signError } = await db.storage
    .from("listing-images")
    .createSignedUrls(
      data.map((m) => m.object_path),
      300,
    );
  if (signError) throw signError;
  for (const row of data) {
    const url = urls?.find((u) => u.path === row.object_path)?.signedUrl;
    if (url)
      items
        .find((p) => p.id === row.listing_id)
        ?.images.push({
          id: row.id,
          url,
          position: row.position,
          alt: row.alt || "",
        });
  }
}
