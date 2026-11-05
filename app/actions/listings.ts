"use server";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/server";
import { reportInput, contactInput } from "@/lib/validation";
export async function toggleFavorite(id: string, enabled: boolean) {
  try {
    z.uuid().parse(id);
    z.boolean().parse(enabled);
    const { db, user } = await requireUser();
    const result = enabled
      ? await db.from("favorites").insert({ user_id: user.id, listing_id: id })
      : await db
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", id);
    if (result.error) return { error: "serverError" };
    return { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error &&
        ["authRequired", "setupMessage"].includes(e.message)
          ? e.message
          : "serverError",
    };
  }
}
export async function submitReport(input: unknown) {
  try {
    const v = reportInput.parse(input),
      { db, user } = await requireUser();
    const { error } = await db
      .from("reports")
      .insert({ ...v, user_id: user.id });
    return error ? { error: "serverError" } : { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error &&
        ["authRequired", "setupMessage"].includes(e.message)
          ? e.message
          : "validation",
    };
  }
}
export async function sendContact(input: unknown) {
  try {
    const v = contactInput.parse(input),
      { db } = await requireUser();
    const { error } = await db.rpc("contact_publisher", {
      p_listing: v.listing_id,
      p_body: v.body,
    });
    return error ? { error: "serverError" } : { success: true };
  } catch (e) {
    return {
      error:
        e instanceof Error &&
        ["authRequired", "setupMessage"].includes(e.message)
          ? e.message
          : "validation",
    };
  }
}
