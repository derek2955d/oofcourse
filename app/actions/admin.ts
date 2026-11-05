"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/server";
import { usStates } from "@/lib/geography";
import { categoryKeys } from "@/lib/catalog";
const reason = z.string().trim().min(3).max(2000);
function refresh() {
  for (const l of ["en", "zh"]) revalidatePath(`/${l}`, "layout");
}
export async function moderateMany(input: unknown) {
  try {
    const v = z
      .object({
        ids: z.array(z.uuid()).min(1).max(25),
        decision: z.enum(["approved", "rejected", "archived", "pending"]),
        reason,
      })
      .parse(input);
    const { db } = await requireAdmin();
    let processed = 0;
    for (const id of v.ids) {
      const { error } = await db.rpc("moderate_listing", {
        p_id: id,
        p_decision: v.decision,
        p_reason: v.reason,
      });
      if (error) {
        refresh();
        return { error: "serverError", processed };
      }
      processed++;
    }
    refresh();
    return { success: "savedSuccess", processed };
  } catch {
    return { error: "adminOnly", processed: 0 };
  }
}
export async function moderateBusiness(input: unknown) {
  try {
    const v = z
        .object({
          id: z.uuid(),
          decision: z.enum(["approved", "rejected", "archived", "pending"]),
          reason,
        })
        .parse(input),
      { db } = await requireAdmin();
    const { error } = await db.rpc("moderate_business", {
      p_id: v.id,
      p_decision: v.decision,
      p_reason: v.reason,
    });
    if (error) return { error: "serverError" };
    refresh();
    return { success: "savedSuccess" };
  } catch {
    return { error: "adminOnly" };
  }
}
export async function restrictUser(input: unknown) {
  try {
    const v = z
        .object({ id: z.uuid(), restricted: z.boolean(), reason })
        .parse(input),
      { db, user } = await requireAdmin();
    if (v.id === user.id) return { error: "validation" };
    const { error } = await db.rpc("restrict_member", {
      p_id: v.id,
      p_restricted: v.restricted,
      p_reason: v.reason,
    });
    if (error) return { error: "serverError" };
    refresh();
    return { success: "savedSuccess" };
  } catch {
    return { error: "adminOnly" };
  }
}
export async function resolveReport(input: unknown) {
  try {
    const v = z.object({ id: z.uuid(), reason }).parse(input),
      { db } = await requireAdmin();
    const { error } = await db
      .from("reports")
      .update({ status: "resolved", resolution: v.reason })
      .eq("id", v.id);
    if (error) return { error: "serverError" };
    refresh();
    return { success: "savedSuccess" };
  } catch {
    return { error: "adminOnly" };
  }
}
export async function updateReference(
  kind: "category" | "subcategory" | "location",
  input: unknown,
) {
  try {
    const { db } = await requireAdmin();
    let result;
    if (kind === "category") {
      const v = z
        .object({
          id: z.enum(categoryKeys),
          name_en: z.string().trim().min(2).max(80),
          name_zh: z.string().trim().min(2).max(80),
          sort_order: z.number().int().min(0).max(100),
          enabled: z.boolean(),
        })
        .parse(input);
      result = await db.from("categories").upsert(v);
    } else if (kind === "subcategory") {
      const v = z
        .object({
          id: z.string().regex(/^[a-z0-9-]{1,80}$/),
          category_id: z.enum(categoryKeys),
          name_en: z.string().trim().min(2).max(80),
          name_zh: z.string().trim().min(2).max(80),
          sort_order: z.number().int().min(0).max(500),
        })
        .parse(input);
      result = await db.from("subcategories").upsert(v);
    } else {
      const v = z
        .object({
          id: z.string().regex(/^[a-z0-9-]{1,80}$/),
          name_en: z.string().trim().min(2).max(100),
          name_zh: z.string().trim().min(2).max(100),
          state: z
            .string()
            .trim()
            .toUpperCase()
            .refine((value) => usStates.some((s) => s[0] === value)),
          city: z.string().trim().min(2).max(100),
          borough: z.string().max(100),
          neighborhood: z.string().max(100),
          enabled: z.boolean(),
        })
        .parse(input);
      result = await db.from("locations").upsert(v);
    }
    if (result.error) return { error: "serverError" };
    refresh();
    return { success: "savedSuccess" };
  } catch {
    return { error: "adminOnly" };
  }
}
export async function updateSettings(input: unknown) {
  try {
    const v = z
        .object({
          daily: z.number().int().min(1).max(20),
          days: z.number().int().min(1).max(90),
        })
        .parse(input),
      { db } = await requireAdmin();
    const { error } = await db.rpc("update_posting_settings", {
      p_daily: v.daily,
      p_days: v.days,
    });
    if (error) return { error: "serverError" };
    refresh();
    return { success: "savedSuccess" };
  } catch {
    return { error: "adminOnly" };
  }
}
