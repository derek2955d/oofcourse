"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCatalogConfig } from "./catalog-provider";
import { nycBoroughIds, nearManhattanNJ } from "@/lib/geography";

export function LocationOptions({ state }: { state: string }) {
  const { locations, locationStates } = useCatalogConfig();
  const locale = useLocale();
  const t = useTranslations("browse");
  if (!["NY", "NJ"].includes(state)) return null;
  return [
    { state: "NY", label: t("boroughs"), ids: [...nycBoroughIds] as string[] },
    {
      state: "NJ",
      label: t("nearManhattanNJ"),
      ids: nearManhattanNJ.map((row) => row[0]) as string[],
    },
  ].map((group) => {
    const rows = group.ids.flatMap((id) => {
      const row = locations.find(
        (row) => row[0] === id && locationStates[id] === group.state,
      );
      return row ? [row] : [];
    });
    return rows.length ? (
      <optgroup key={group.state} label={group.label}>
        {rows.map((row) => (
          <option value={row[0]} key={row[0]}>
            {row[locale === "zh" ? 2 : 1]}
          </option>
        ))}
      </optgroup>
    ) : null;
  });
}
