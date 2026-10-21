import "server-only";
import { locale as rootLocale } from "next/root-params";
import { isLocale, type Locale } from "./config";
export async function getLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : "en";
}
