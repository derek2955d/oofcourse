import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("terms");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="terms" params={params} />;
}
