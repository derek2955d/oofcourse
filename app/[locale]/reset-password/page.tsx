import { AuthPage, authMetadata } from "@/components/auth-page";
export const generateMetadata = authMetadata("reset");
export default function Page({
  params,
}: {
  params: Promise<{ locale: "en" | "zh" }>;
}) {
  return <AuthPage params={params} mode="reset" />;
}
