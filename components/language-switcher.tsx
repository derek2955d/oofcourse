"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "./locale-provider";
import { switchLocalePath, type Locale } from "@/lib/i18n/config";
export function LanguageSwitcher() {
  const locale = useLocale(),
    pathname = usePathname(),
    query = useSearchParams().toString();
  return (
    <nav
      aria-label={locale === "zh" ? "语言" : "Language"}
      className="language-switcher"
    >
      {(["en", "zh"] as Locale[]).map((l, i) => (
        <span key={l}>
          {i > 0 && (
            <span aria-hidden="true" className="language-divider">
              |
            </span>
          )}
          <Link
            href={switchLocalePath(pathname, query, l)}
            hrefLang={l === "en" ? "en-US" : "zh-CN"}
            lang={l === "en" ? "en-US" : "zh-CN"}
            aria-current={locale === l ? "true" : undefined}
          >
            {l === "en" ? "English" : "中文"}
          </Link>
        </span>
      ))}
    </nav>
  );
}
