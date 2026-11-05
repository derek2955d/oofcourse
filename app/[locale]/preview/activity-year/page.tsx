import { redirect } from "next/navigation";
import type { Locale } from "@/lib/catalog";
// Retire the rejected fictional sample; retained links now open sourced events.
export default async function RetiredSample({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/weekend`);
}
