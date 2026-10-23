"use client";
import { useCatalogConfig } from "./catalog-provider";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  MapPin,
  ChevronDown,
  Plus,
  Search,
  Menu,
  X,
  House,
  Grid2X2,
  Heart,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { categoryKeys, type Locale } from "@/lib/catalog";
export function LanguageSwitcher() {
  const t = useTranslations(),
    locale = useLocale(),
    pathname = usePathname(),
    params = useSearchParams();
  return (
    <nav className="language-switch" aria-label={t("language")}>
      {(["en", "zh"] as const).map((l) => (
        <Link
          key={l}
          href={{ pathname, query: Object.fromEntries(params.entries()) }}
          locale={l}
          lang={l === "zh" ? "zh-CN" : "en-US"}
          hrefLang={l === "zh" ? "zh-CN" : "en-US"}
          aria-current={locale === l ? "page" : undefined}
        >
          {l === "en" ? "EN" : "中文"}
        </Link>
      ))}
    </nav>
  );
}
export function LocationSelector() {
  const { locations } = useCatalogConfig();
  const t = useTranslations(),
    locale = useLocale() as Locale,
    params = useSearchParams(),
    pathname = usePathname(),
    router = useRouter();
  return (
    <label className="location-select">
      <MapPin size={16} />
      <span className="sr-only">{t("navLocation")}</span>
      <select
        aria-label={t("navLocation")}
        value={params.get("location") || "nyc"}
        onChange={(e) => {
          const q = new URLSearchParams(params);
          q.set("location", e.target.value);
          q.delete("page");
          router.push(`${pathname}?${q}`);
        }}
      >
        {locations.map(([slug, en, zh]) => (
          <option key={slug} value={slug}>
            {locale === "zh" ? zh : en}
          </option>
        ))}
      </select>
      <ChevronDown size={13} />
    </label>
  );
}
export function SiteHeader() {
  const { categories } = useCatalogConfig();
  const t = useTranslations(),
    locale = useLocale() as Locale,
    pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-main">
        <Link className="wordmark" href="/" aria-label="OofCourse home">
          OofCourse<span>.</span>
          <i />
        </Link>
        <nav className="desktop-categories" aria-label={t("navCategories")}>
          {categoryKeys.map((c) => (
            <Link
              key={c}
              href={`/${c}`}
              aria-current={pathname === `/${c}` ? "page" : undefined}
            >
              {categories[c][locale]}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <LocationSelector />
          <LanguageSwitcher />
          <Link href="/login" className="login-link">
            {t("navLogin")}
          </Link>
          <Link href="/post" className="button primary post-desktop">
            <Plus size={16} />
            {t("navPost")}
          </Link>
          <button
            className="icon-button menu-button"
            onClick={() => setOpen(!open)}
            aria-label={t(open ? "navClose" : "navMenu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <div className="container mobile-header-tools">
        <LocationSelector />
        <Link href="/search" className="text-link">
          <Search size={16} />
          {t("navSearch")}
        </Link>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu container"
          aria-label={t("navCategories")}
          onClick={() => setOpen(false)}
        >
          {categoryKeys.map((c) => (
            <Link href={`/${c}`} key={c}>
              {categories[c][locale]}
              <ArrowRight size={16} />
            </Link>
          ))}
          <Link href="/login">{t("navLogin")}</Link>
        </nav>
      )}
    </header>
  );
}
export function MobileBottomNav() {
  const t = useTranslations(),
    pathname = usePathname();
  const nav = [
    ["/", "navHome", House],
    ["/categories", "navCategories", Grid2X2],
    ["/post", "navPost", Plus],
    ["/saved", "navSaved", Heart],
    ["/account", "navAccount", UserRound],
  ] as const;
  return (
    <nav className="mobile-bottom" aria-label={t("navMenu")}>
      {nav.map(([path, key, Icon]) => (
        <Link
          key={path}
          href={path}
          className={path === "/post" ? "post-tab" : ""}
          aria-current={pathname === path ? "page" : undefined}
        >
          <span>
            <Icon size={21} />
          </span>
          {t(key)}
        </Link>
      ))}
    </nav>
  );
}
export function SearchBar({
  large = false,
  category,
}: {
  large?: boolean;
  category?: string;
}) {
  const { locations, categories } = useCatalogConfig();
  const t = useTranslations(),
    locale = useLocale() as Locale,
    params = useSearchParams();
  return (
    <form
      className={`search-bar ${large ? "hero-search" : ""}`}
      action={`/${locale}/${category || "search"}`}
    >
      {!large &&
        Array.from(params.entries())
          .filter(([key]) => !["q", "page", "category"].includes(key))
          .map(([key, value]) => (
            <input type="hidden" name={key} value={value} key={key} />
          ))}
      <label className="search-keyword">
        <Search size={20} />
        <span className="sr-only">{t("keyword")}</span>
        <input
          type="search"
          name="q"
          placeholder={t("searchPlaceholder")}
          aria-label={t("keyword")}
          maxLength={150}
          defaultValue={params.get("q") || ""}
        />
      </label>
      {large && (
        <>
          <label className="search-category">
            <span className="sr-only">{t("category")}</span>
            <select name="category" aria-label={t("category")} defaultValue="">
              <option value="">{t("allCategories")}</option>
              {categoryKeys.map((c) => (
                <option value={c} key={c}>
                  {categories[c][locale]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} />
          </label>
          <label className="search-area">
            <MapPin size={17} />
            <span className="sr-only">{t("location")}</span>
            <select
              name="location"
              aria-label={t("location")}
              defaultValue={params.get("location") || "nyc"}
            >
              {locations.map(([s, en, zh]) => (
                <option key={s} value={s}>
                  {locale === "zh" ? zh : en}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <button className="button primary" type="submit">
        <Search size={18} />
        <span>{t("searchButton")}</span>
      </button>
    </form>
  );
}
