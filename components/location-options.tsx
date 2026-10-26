"use client";

import { useLocale } from "next-intl";
import { useCatalogConfig } from "./catalog-provider";
import { nycBoroughIds } from "@/lib/geography";

export function LocationOptions({ state }: { state: string }) {
  const { locations, locationStates } = useCatalogConfig();
  const locale = useLocale();
  return nycBoroughIds.flatMap((borough) => {
    const row = locations.find(
      ([id]) => id === borough && locationStates[id] === state,
    );
    return row
      ? [
          <option value={row[0]} key={row[0]}>
            {row[locale === "zh" ? 2 : 1]}
          </option>,
        ]
      : [];
  });
}
