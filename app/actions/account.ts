"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { profileInput, businessInput } from "@/lib/validation";
export async function updateProfile(input: unknown) {
  try {
    const v = profileInput.parse(input),
      { db, user } = await requireUser();
    const { error } = await db.from("profiles").update(v).eq("id", user.id);
    if (error) return { error: "serverError" };
    for (const l of ["en", "zh"]) revalidatePath(`/${l}/account`, "layout");
    return { success: "savedSuccess" };
  } catch {
    return { error: "validation" };
  }
}
export async function saveBusiness(input: unknown) {
  try {
    const v = businessInput.parse(input),
      { db, user } = await requireUser();
    const { error } = await db
      .from("business_profiles")
      .upsert(
        { ...v, user_id: user.id, status: "pending" },
        { onConflict: "user_id" },
      );
    if (error) return { error: "serverError" };
    for (const l of ["en", "zh"]) revalidatePath(`/${l}/account`, "layout");
    return { success: "savedSuccess" };
  } catch {
    return { error: "validation" };
  }
}
export async function replyMessage(input: unknown) {
  try {
    const v = z
        .object({
          conversation_id: z.uuid(),
          body: z.string().trim().min(10).max(2000),
        })
        .parse(input),
      { db, user } = await requireUser();
    const { error } = await db
      .from("messages")
      .insert({ ...v, sender_id: user.id });
    if (error) return { error: "serverError" };
    for (const l of ["en", "zh"]) revalidatePath(`/${l}/account/messages`);
    return { success: "messageSent" };
  } catch {
    return { error: "serverError" };
  }
}
export async function uploadBusinessLogo(form: FormData) {
  try {
    const { db, user } = await requireUser();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 4194304)
      return { error: "photoError" };
    const { uploadSignature } = await import("@/lib/security");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!uploadSignature(bytes, file.type)) return { error: "photoError" };
    const { data: business, error } = await db
      .from("business_profiles")
      .select("id,logo_path")
      .eq("user_id", user.id)
      .single();
    if (error || !business) return { error: "serverError" };
    const changed = await db
      .from("business_profiles")
      .update({ status: "pending" })
      .eq("id", business.id);
    if (changed.error) return { error: "serverError" };
    const sharp = (await import("sharp")).default;
    const image = await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `${user.id}/${business.id}/${crypto.randomUUID()}.webp`;
    const stored = await db.storage
      .from("business-logos")
      .upload(path, image, { contentType: "image/webp", upsert: false });
    if (stored.error) return { error: "uploadError" };
    const saved = await db
      .from("business_profiles")
      .update({ logo_path: path, status: "pending" })
      .eq("id", business.id);
    if (saved.error) {
      await db.storage.from("business-logos").remove([path]);
      return { error: "uploadError" };
    }
    if (business.logo_path)
      await db.storage.from("business-logos").remove([business.logo_path]);
    for (const l of ["en", "zh"]) revalidatePath(`/${l}/account/business`);
    return { success: "savedSuccess" };
  } catch {
    return { error: "uploadError" };
  }
}
