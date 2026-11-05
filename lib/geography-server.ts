import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { activeState, stateCookie } from "./geography";
import { publicDB } from "./supabase/server";
export async function selectedState(value?: string) {
  return activeState(value || (await cookies()).get(stateCookie)?.value);
}
export const enabledAreas = cache(async (state?: string) => {
  let query = publicDB()
    .from("locations")
    .select("id,state,city", { count: "exact" })
    .eq("enabled", true);
  if (state) query = query.eq("state", state);
  const { data, error, count } = await query;
  if (error) throw error;
  // A truncated registry must never be used as proof that all rows belong to one state.
  if (count !== (data || []).length)
    throw new Error(
      "Geographic registry exceeds the current page; migration/pagination required",
    );
  return data || [];
});
