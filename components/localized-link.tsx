"use client";
import Link from "next/link";
import { useLocale } from "./locale-provider";
import { localePath } from "@/lib/i18n/config";
export default function LocalizedLink(
  props: React.ComponentProps<typeof Link>,
) {
  const locale = useLocale();
  return (
    <Link
      {...props}
      href={
        typeof props.href === "string"
          ? localePath(locale, props.href)
          : {
              ...props.href,
              pathname: localePath(locale, props.href.pathname || "/"),
            }
      }
    />
  );
}
