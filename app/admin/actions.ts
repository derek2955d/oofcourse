"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  databaseConfigured,
  supabaseServer,
  requireAdmin,
} from "@/lib/supabase/server";
const slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(160);
const text = z.string().trim().min(1).max(1000);
const https = z
  .string()
  .url()
  .refine((x) => {
    const u = new URL(x);
    return u.protocol === "https:" && !u.username && !u.password;
  }, "Use an HTTPS URL without credentials.");
const schemas = {
  products: z.object({
    id: z.string().uuid().optional(),
    name: text,
    name_zh: z.string().max(1000).default(""),
    description_zh: z.string().max(8000).default(""),
    slug,
    description: z.string().min(1).max(8000),
    category_id: z.string().uuid(),
    retailer_id: z.string().uuid().nullable(),
    source_id: z.string().uuid().nullable(),
    merchant: text,
    image_url: z.union([https, z.string().startsWith("/illustrations/")]),
    image_license: text,
    content_scope: z.enum(["neutral", "retailer_restricted"]),
    content_retailer_id: z.string().uuid().nullable(),
    status: z.enum([
      "draft",
      "pending_review",
      "published",
      "unverified",
      "expired",
      "archived",
    ]),
    is_demo: z.boolean(),
    last_checked_at: z.string().datetime().nullable(),
    expires_at: z.string().datetime().nullable(),
  }),
  categories: z.object({
    id: z.string().uuid().optional(),
    name: text,
    name_zh: z.string().max(1000).default(""),
    slug,
    description: z.string().max(1000),
  }),
  retailers: z.object({
    id: z.string().uuid().optional(),
    name: text,
    slug,
    homepage_url: https,
    allowed_hosts: z.array(z.string().regex(/^[a-z0-9.-]+$/)).max(10),
    affiliate_approved: z.boolean(),
    enabled: z.boolean(),
  }),
  offers: z.object({
    id: z.string().uuid().optional(),
    product_id: z.string().uuid(),
    retailer_id: z.string().uuid(),
    source_id: z.string().uuid(),
    status: z.enum([
      "draft",
      "pending_review",
      "published",
      "unverified",
      "expired",
      "archived",
    ]),
    is_demo: z.boolean(),
    currency: z.string().regex(/^[A-Z]{3}$/),
    current_price: z.number().finite().nonnegative().nullable(),
    original_price: z.number().finite().nonnegative().nullable(),
    price_verified: z.boolean(),
    price_usage_authorized: z.boolean(),
    image_url: z.union([https, z.string().startsWith("/illustrations/")]),
    image_license: text,
    content_scope: z.enum(["neutral", "retailer_restricted"]),
    content_retailer_id: z.string().uuid().nullable(),
    last_checked_at: z.string().datetime().nullable(),
    expires_at: z.string().datetime().nullable(),
  }),
  affiliate_links: z.object({
    offer_id: z.string().uuid(),
    id: z.string().uuid().optional(),
    product_id: z.string().uuid(),
    retailer_id: z.string().uuid(),
    source_id: z.string().uuid(),
    url: https,
    approved: z.boolean(),
    enabled: z.boolean(),
    checked_at: z.string().datetime().nullable(),
    expires_at: z.string().datetime().nullable(),
  }),
  deal_sources: z.object({
    id: z.string().uuid().optional(),
    name: text,
    merchant: text,
    retailer_id: z.string().uuid(),
    source_type: z.enum(["official_api", "approved_feed", "manual"]),
    enabled: z.boolean(),
    affiliate_approved: z.boolean(),
    homepage_url: https,
  }),
};
export type AdminEntity = keyof typeof schemas;
export async function loginAdmin(form: FormData) {
  if (!databaseConfigured())
    return {
      error:
        "Supabase is not connected. Use the clearly labeled local demo workspace.",
    };
  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(1).max(200) })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success)
    return { error: "Enter a valid email address and password." };
  try {
    const client = await supabaseServer();
    const { error } = await client.auth.signInWithPassword(parsed.data);
    if (error) return { error: "Unable to sign in. Check your credentials." };
    try {
      await requireAdmin();
    } catch {
      await client.auth.signOut();
      return { error: "Administrator access is required." };
    }
    for (const locale of ["en", "zh"]) revalidatePath(`/${locale}/admin`);
    return { success: true };
  } catch {
    return {
      error: "Unable to connect to the configured authentication service.",
    };
  }
}
export async function logoutAdmin() {
  if (databaseConfigured()) {
    const client = await supabaseServer();
    await client.auth.signOut();
  }
  for (const locale of ["en", "zh"]) revalidatePath(`/${locale}/admin`);
}
export async function saveAdminRecord(entity: AdminEntity, input: unknown) {
  try {
    const client = await requireAdmin();
    if (!Object.hasOwn(schemas, entity))
      return { error: "Unsupported entity." };
    const parsed = schemas[entity].safeParse(input);
    if (!parsed.success)
      return { error: "Check required fields, IDs, URLs, and dates." };
    const { error } = await client
      .from(entity)
      .upsert(parsed.data as Record<string, unknown>);
    if (error)
      return {
        error:
          "Save rejected. Check related records, source permissions, and publication requirements.",
      };
    for (const locale of ["en", "zh"]) revalidatePath(`/${locale}/admin`);
    return { success: true };
  } catch {
    return {
      error:
        "Administrator authentication and configured Supabase are required.",
    };
  }
}
export async function archiveAdminProduct(id: string) {
  try {
    const client = await requireAdmin();
    const parsed = z.string().uuid().safeParse(id);
    if (!parsed.success) return { error: "Invalid product ID." };
    const { error } = await client
      .from("products")
      .update({ status: "archived" })
      .eq("id", id);
    if (error) return { error: "Archive rejected." };
    for (const locale of ["en", "zh"]) revalidatePath(`/${locale}/admin`);
    return { success: true };
  } catch {
    return { error: "Administrator authentication required." };
  }
}
