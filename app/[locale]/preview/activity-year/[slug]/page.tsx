import { redirect } from "next/navigation";
import type { Locale } from "@/lib/catalog";
export default async function RetiredSampleDetail({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/weekend`);
}
