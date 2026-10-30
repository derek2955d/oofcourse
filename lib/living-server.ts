import "server-only";
import { nearManhattanNJ } from "./geography";
import { cache } from "react";
import { configured, publicDB } from "./supabase/server";
import { enabledAreas } from "./geography-server";
import { eventDay, newYorkToday, eventHorizon } from "./living";
export type CommunityEvent = {
  id: string;
  title: string;
  location: string;
  day: string;
};
export const upcomingEvents = cache(
  async (
    nearby = false,
    days = 31,
  ): Promise<{ items: CommunityEvent[]; error: boolean }> => {
    if (!configured()) return { items: [], error: false };
    try {
      const areas = (await enabledAreas(nearby ? undefined : "NY")).filter(
        (area) =>
          !nearby ||
          (area.state === "NY" &&
            (area.city === "New York" || area.id === "beacon")) ||
          (area.state === "NJ" &&
            nearManhattanNJ.some((row) => row[0] === area.id)),
      );
      if (!areas.length) return { items: [], error: false };
      const today = newYorkToday();
      // Apply visibility, geography, date and sort BEFORE limiting the result.
      const { data, error } = await publicDB()
        .from("listings")
        .select("id,title,location_id,details")
        .eq("category_id", "community")
        .eq("subcategory", "events")
        .eq("status", "approved")
        .gt("expires_at", new Date().toISOString())
        .in(
          "location_id",
          areas.map((area) => area.id),
        )
        .gte("details->>event_date", today)
        .lte("details->>event_date", eventHorizon(today, days))
        .order("details->>event_date", { ascending: true })
        .order("id")
        .limit(3);
      if (error) throw error;
      const items = (data || []).flatMap((row) => {
        const day = eventDay(row.details?.event_date);
        return day && day >= today && day <= eventHorizon(today, days)
          ? [{ id: row.id, title: row.title, location: row.location_id, day }]
          : [];
      });
      return { items, error: false };
    } catch {
      return { items: [], error: true };
    }
  },
);
