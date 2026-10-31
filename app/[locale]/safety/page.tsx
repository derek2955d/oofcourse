import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("safety");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="safety" params={params} />;
}
