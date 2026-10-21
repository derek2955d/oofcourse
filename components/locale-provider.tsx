"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
const Context = createContext<Locale>("en");
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return <Context.Provider value={locale}>{children}</Context.Provider>;
}
export const useLocale = () => useContext(Context);
