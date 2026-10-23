import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("help");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="help" params={params} />;
}
