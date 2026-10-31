import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("privacy");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="privacy" params={params} />;
}
