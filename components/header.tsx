"use client";
import Link from "./localized-link";
import { Search, Menu, X, ArrowRight } from "lucide-react";
import { Suspense, useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "./locale-provider";
import { LanguageSwitcher } from "./language-switcher";
import { SavedNav } from "./saved";
import { localePath } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/messages";
import { categories } from "@/lib/data";
import { categoryName } from "@/lib/i18n/catalog";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="OofCourse">
      <span className="brand-oo" aria-hidden="true">
        <i />
        <i />
      </span>
      <span>
        OofCourse<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function Header() {
  const locale = useLocale(),
    pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = [
    ["/deals", t(locale, "deals")],
    ["/categories", t(locale, "categories")],
    ["/guides", t(locale, "guides")],
  ];
  return (
    <>
      <div className="utility-bar container">
        <span>
          Great Deals? <strong>Of Course!</strong>
        </span>
        <Suspense>
          <LanguageSwitcher />
        </Suspense>
      </div>
      <header className="site-header">
        <div className="container header-main">
          <Brand />
          <form
            className="discovery-search"
            action={localePath(locale, "/search")}
            role="search"
          >
            <Search size={19} />
            <input
              type="search"
              name="q"
              aria-label={t(locale, "searchDeals")}
              placeholder={t(locale, "searchPlaceholder")}
              maxLength={200}
            />
            <button aria-label={t(locale, "submitSearch")}>
              <ArrowRight size={19} />
            </button>
          </form>
          <SavedNav />
          <button
            className="mobile-toggle"
            aria-label={t(locale, open ? "menuClose" : "menuOpen")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        <nav
          className="container discovery-nav"
          aria-label={t(locale, "mainNav")}
        >
          {nav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === localePath(locale, href) ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
          <span className="nav-divider" />
          {categories
            .filter((c) =>
              ["tech", "home", "fashion", "beauty", "toys"].includes(c.slug),
            )
            .map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`}>
                {categoryName(c, locale)}
              </Link>
            ))}
          <Link href="/categories">{t(locale, "moreCategories")}</Link>
        </nav>
        {open && (
          <nav
            id="mobile-nav"
            className="mobile-nav container"
            aria-label={t(locale, "mobileNav")}
            onClick={() => setOpen(false)}
          >
            {nav.map(([href, label]) => (
              <Link key={href} href={href}>
                {label}
                <ArrowRight size={16} />
              </Link>
            ))}
            <Link href="/saved">
              {t(locale, "saved")}
              <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
