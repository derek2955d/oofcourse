"use client";
import { useCatalogConfig } from "./catalog-provider";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import {
  MapPin,
  Globe2,
  Check,
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
import { useSelectedState } from "./use-geography";
import { availableStates, stateLabel } from "@/lib/geography";
import { visibleCategoryKeys, type Locale } from "@/lib/catalog";
export function LanguageSwitcher() {
  const t = useTranslations(),
    locale = useLocale(),
    pathname = usePathname(),
    params = useSearchParams();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const label = `${t("language")}: ${locale === "en" ? "English" : "中文"}`;
  return (
    <div className="language-switch" ref={root}>
      <button
        ref={trigger}
        className="header-setting-button"
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <Globe2 size={19} aria-hidden="true" />
      </button>
      <nav
        id={panelId}
        hidden={!open}
        className="language-options"
        aria-label={t("language")}
      >
        {(["en", "zh"] as const).map((l) => (
          <Link
            key={l}
            href={{ pathname, query: Object.fromEntries(params.entries()) }}
            locale={l}
            lang={l === "zh" ? "zh-CN" : "en-US"}
            hrefLang={l === "zh" ? "zh-CN" : "en-US"}
            aria-current={locale === l ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            <span>{l === "en" ? "English" : "中文"}</span>
            {locale === l && <Check size={16} aria-hidden="true" />}
          </Link>
        ))}
      </nav>
    </div>
  );
}
export function LocationSelector() {
  const t = useTranslations(),
    locale = useLocale(),
    selectedState = useSelectedState(),
    params = useSearchParams(),
    pathname = usePathname(),
    router = useRouter();
  const state = selectedState === "NJ" ? "NY" : selectedState;
  return (
    <label
      className="location-select location-compact"
      title={`${t("geo.state")}: ${stateLabel(state, locale)}`}
    >
      <MapPin size={19} aria-hidden="true" />
      <span className="sr-only">{t("geo.state")}</span>
      <select
        aria-label={t("geo.state")}
        value={state}
        onChange={(e) => {
          const q = new URLSearchParams(params);
          q.set("state", e.target.value);
          q.delete("location");
          q.delete("page");
          router.push(`${pathname}?${q}`);
        }}
      >
        {availableStates
          .filter(([code]) => code === "NY")
          .map(([code, en, zh]) => (
            <option key={code} value={code}>
              {locale === "zh" ? zh : en}
            </option>
          ))}
      </select>
    </label>
  );
}
export function SiteHeader({
  viewer = null,
}: {
  viewer?: { displayName: string | null } | null;
}) {
  const { categories } = useCatalogConfig();
  const state = useSelectedState();
  const t = useTranslations(),
    locale = useLocale() as Locale,
    pathname = usePathname();
  const [open, setOpen] = useState(false);
  const accountName = viewer?.displayName || t("navAccount");
  const accountLink = viewer ? (
    <Link
      href="/account"
      className="header-account"
      title={accountName}
      aria-label={`${accountName} · ${t("navAccount")}`}
    >
      <span className="header-avatar" aria-hidden="true">
        {viewer.displayName ? (
          Array.from(viewer.displayName)[0].toLocaleUpperCase(locale)
        ) : (
          <UserRound size={16} />
        )}
      </span>
      <span className="header-account-name">{accountName}</span>
    </Link>
  ) : (
    <Link href="/login" className="login-link">
      {t("navLogin")}
    </Link>
  );
  return (
    <header className="site-header">
      <div className="container header-main">
        <Link className="wordmark" href="/" aria-label="OofCourse home">
          OofCourse<span>.</span>
          <i />
        </Link>
        <nav className="desktop-categories" aria-label={t("navCategories")}>
          {visibleCategoryKeys.map((c) => (
            <Link
              key={c}
              href={`/${c}?state=${state}`}
              aria-current={pathname === `/${c}` ? "page" : undefined}
            >
              {categories[c][locale]}
            </Link>
          ))}
          <Link
            href="/weekend"
            aria-current={pathname.startsWith("/weekend") ? "page" : undefined}
          >
            {t("weekend.nav")}
          </Link>
        </nav>
        <div className="header-actions">
          <LocationSelector />
          <LanguageSwitcher />
          {accountLink}
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
        <div className="mobile-header-links">
          <Link href="/search" className="text-link">
            <Search size={16} />
            {t("navSearch")}
          </Link>
          {viewer && accountLink}
        </div>
      </div>
      {open && (
        <nav
          id="mobile-menu"
          className="mobile-menu container"
          aria-label={t("navCategories")}
          onClick={() => setOpen(false)}
        >
          {visibleCategoryKeys.map((c) => (
            <Link href={`/${c}?state=${state}`} key={c}>
              {categories[c][locale]}
              <ArrowRight size={16} />
            </Link>
          ))}
          <Link href="/weekend">
            {t("weekend.nav")}
            <ArrowRight size={16} />
          </Link>
          <Link href="/living">
            {t("living.nav")}
            <ArrowRight size={16} />
          </Link>
          <Link
            href={viewer ? "/account" : "/login"}
            className="mobile-menu-account"
          >
            <UserRound size={18} />
            {viewer ? accountName : t("navLogin")}
            {viewer && <span>{t("navAccount")}</span>}
          </Link>
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
  const state = useSelectedState();
  const { categories } = useCatalogConfig();
  const t = useTranslations(),
    locale = useLocale() as Locale,
    params = useSearchParams(),
    router = useRouter(),
    pathname = usePathname();
  return (
    <form
      className={`search-bar ${large ? "hero-search" : ""}`}
      action={`/${locale}/${category || "search"}`}
    >
      {!large && <input type="hidden" name="state" value={state} />}
      {!large &&
        Array.from(params.entries())
          .filter(
            ([key, value]) =>
              ![
                "q",
                "page",
                "category",
                "state",
                ...(category === "community"
                  ? ["location", "subcategory"]
                  : []),
                ...(category === "marketplace" ? ["condition", "free"] : []),
                ...(category === "jobs"
                  ? ["subcategory", "industry", "workplace", "pay_period"]
                  : []),
              ].includes(key) &&
              !(
                category === "jobs" &&
                key === "employment" &&
                !["full-time", "part-time"].includes(value)
              ),
          )
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
              {visibleCategoryKeys.map((c) => (
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
              name="state"
              aria-label={t("geo.state")}
              value={state}
              onChange={(e) => {
                const q = new URLSearchParams(params);
                q.set("state", e.target.value);
                q.delete("location");
                q.delete("page");
                router.push(`${pathname}?${q}`);
              }}
            >
              {availableStates.map(([s, en, zh]) => (
                <option key={s} value={s}>
                  {locale === "zh" ? zh : en}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
      <button
        className="button primary"
        type="submit"
        aria-label={t("searchButton")}
      >
        <Search size={18} />
        <span>{t("searchButton")}</span>
      </button>
    </form>
  );
}
