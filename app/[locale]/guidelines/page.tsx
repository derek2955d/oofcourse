import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("guidelines");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="guidelines" params={params} />;
}
