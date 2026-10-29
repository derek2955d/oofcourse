"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import sharp from "sharp";
import { requireUser } from "@/lib/supabase/server";
import { listingInput, draftInput, validateDetails } from "@/lib/validation";
import { uploadSignature } from "@/lib/security";
function errorKey(e: unknown) {
  return e instanceof Error &&
    ["authRequired", "setupMessage", "verifiedRequired"].includes(e.message)
    ? e.message
    : "serverError";
}
export async function saveListing(input: unknown, submit = false) {
  try {
    const { db, user } = await requireUser();
    if (submit && !user.email_confirmed_at)
      return { error: "verifiedRequired" };
    const raw = (submit ? listingInput : draftInput).safeParse(input);
    if (!raw.success) return { error: "validation" };
    const v = raw.data;
    if (
      v.category === "community" &&
      v.subcategory === "outings" &&
      process.env.WEEKEND_SUBMISSIONS_ENABLED !== "true"
    )
      return { error: "weekend.paused" };
    const details = submit
      ? validateDetails(v.category, v.details, v.subcategory)
      : v.details;
    const record = {
      category_id: v.category,
      subcategory: v.subcategory,
      location_id: v.location,
      title: v.title,
      description: v.description,
      price:
        v.category === "community" && v.subcategory === "outings"
          ? null
          : v.price,
      currency: "USD",
      details,
      status: submit ? "pending" : "draft",
    };
    const result = v.id
      ? await db
          .from("listings")
          .update(record)
          .eq("id", v.id)
          .eq("user_id", user.id)
          .select("id")
          .single()
      : await db
          .from("listings")
          .insert({ ...record, user_id: user.id })
          .select("id")
          .single();
    if (result.error)
      return {
        error: result.error.message.includes("Rate limit")
          ? "rateLimited"
          : "serverError",
      };
    for (const l of ["en", "zh"]) {
      revalidatePath(`/${l}/account`, "layout");
      revalidatePath(`/${l}/${v.category}`);
      revalidatePath(`/${l}/weekend`);
      revalidatePath(`/${l}`);
    }
    return { id: result.data.id, success: submit ? "submitted" : "draftSaved" };
  } catch (e) {
    return { error: errorKey(e) };
  }
}
export async function uploadListingPhoto(form: FormData) {
  try {
    const { db, user } = await requireUser();
    const listing = z.uuid().parse(form.get("listing_id")),
      file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 4194304 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return { error: "photoError" };
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!uploadSignature(bytes, file.type)) return { error: "photoError" };
    const { data: own, error: ownError } = await db
      .from("listings")
      .select("id")
      .eq("id", listing)
      .eq("user_id", user.id)
      .eq("status", "draft")
      .single();
    if (ownError || !own) return { error: "authRequired" };
    const { count, error: countError } = await db
      .from("listing_media")
      .select("id", { count: "exact", head: true })
      .eq("listing_id", listing);
    if (countError || (count || 0) >= 8) return { error: "photoError" };
    const image = await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `${user.id}/${listing}/${crypto.randomUUID()}.webp`;
    const uploaded = await db.storage
      .from("listing-images")
      .upload(path, image, { contentType: "image/webp", upsert: false });
    if (uploaded.error) return { error: "uploadError" };
    const { data: media, error } = await db
      .from("listing_media")
      .insert({
        listing_id: listing,
        object_path: path,
        position: count || 0,
        alt: "",
      })
      .select("id,position")
      .single();
    if (error) {
      await db.storage.from("listing-images").remove([path]);
      return { error: "uploadError" };
    }
    const { data: signed } = await db.storage
      .from("listing-images")
      .createSignedUrl(path, 300);
    return {
      media: {
        id: media.id,
        url: signed?.signedUrl || "",
        position: media.position,
        alt: "",
      },
    };
  } catch {
    return { error: "uploadError" };
  }
}
export async function removeListingPhoto(id: string) {
  try {
    z.uuid().parse(id);
    const { db } = await requireUser();
    const { data, error } = await db
      .from("listing_media")
      .select("object_path,listing_id")
      .eq("id", id)
      .single();
    if (error || !data) return { error: "serverError" };
    const removed = await db
      .from("listing_media")
      .delete()
      .eq("id", id)
      .select("id");
    if (removed.error || !removed.data?.length) return { error: "serverError" };
    await db.storage.from("listing-images").remove([data.object_path]);
    const { data: rows } = await db
      .from("listing_media")
      .select("id")
      .eq("listing_id", data.listing_id)
      .order("position");
    if (rows?.length) {
      const r = await db.rpc("reorder_media", {
        p_listing: data.listing_id,
        p_ids: rows.map((m) => m.id),
      });
      if (r.error) return { error: "serverError" };
    }
    return { success: true };
  } catch {
    return { error: "serverError" };
  }
}
export async function reorderPhotos(listing: string, ids: string[]) {
  try {
    z.uuid().parse(listing);
    z.array(z.uuid()).max(8).parse(ids);
    const { db } = await requireUser();
    const { error } = await db.rpc("reorder_media", {
      p_listing: listing,
      p_ids: ids,
    });
    return error ? { error: "serverError" } : { success: true };
  } catch {
    return { error: "serverError" };
  }
}
export async function archiveListing(id: string) {
  try {
    z.uuid().parse(id);
    const { db, user } = await requireUser();
    const { error, data } = await db
      .from("listings")
      .update({ status: "archived" })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");
    if (error || !data?.length) return { error: "serverError" };
    for (const l of ["en", "zh"]) revalidatePath(`/${l}`, "layout");
    return { success: true };
  } catch (e) {
    return { error: errorKey(e) };
  }
}
