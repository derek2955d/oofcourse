"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDefaultState } from "./catalog-provider";
import { cookieState, activeState, stateCookie } from "@/lib/geography";
export function useSelectedState() {
  const params = useSearchParams(),
    initial = useDefaultState();
  const state = activeState(
    params.get("state") ||
      (typeof document !== "undefined"
        ? cookieState(document.cookie)
        : initial) ||
      initial,
  );
  useEffect(() => {
    document.cookie = `${stateCookie}=${state}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }, [state]);
  return state;
}
