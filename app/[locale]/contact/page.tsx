import { InfoPage, infoMetadata } from "@/components/information";
export const generateMetadata = infoMetadata("contact");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <InfoPage slug="contact" params={params} />;
}
