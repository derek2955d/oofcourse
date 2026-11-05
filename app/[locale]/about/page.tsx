import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("about");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="about" params={params} />;
}
