"use client";

import { MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import { stateLabel } from "@/lib/geography";
import { useSelectedState } from "./use-geography";

export function FooterLocation() {
  const state = useSelectedState();
  const locale = useLocale();

  return (
    <span className="footer-location">
      <MapPin size={14} aria-hidden="true" />
      {stateLabel(state, locale)}
    </span>
  );
}
