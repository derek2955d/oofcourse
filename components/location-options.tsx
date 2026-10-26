"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCatalogConfig } from "./catalog-provider";

export function LocationOptions({ state }: { state: string }) {
  const { locations, locationStates } = useCatalogConfig();
  const locale = useLocale();
  const t = useTranslations("browse");
  const boroughs = new Set([
    "manhattan",
    "brooklyn",
    "queens",
    "bronx",
    "staten-island",
  ]);
  const enabled = locations.filter(([id]) => locationStates[id] === state);
  const groups = [
    { label: t("citywide"), items: enabled.filter(([id]) => id === "nyc") },
    { label: t("boroughs"), items: enabled.filter(([id]) => boroughs.has(id)) },
    {
      label: t("localAreas"),
      items: enabled.filter(([id]) => id !== "nyc" && !boroughs.has(id)),
    },
  ];
  return groups
    .filter((group) => group.items.length)
    .map((group) => (
      <optgroup label={group.label} key={group.label}>
        {group.items.map(([id, en, zh]) => (
          <option value={id} key={id}>
            {locale === "zh" ? zh : en}
          </option>
        ))}
      </optgroup>
    ));
}
