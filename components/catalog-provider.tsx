"use client";
import { createContext, useContext } from "react";
import { defaultTaxonomy, type Taxonomy } from "@/lib/taxonomy";
const Context = createContext<Taxonomy>(defaultTaxonomy);
export function CatalogProvider({
  data,
  children,
}: {
  data: Taxonomy;
  children: React.ReactNode;
}) {
  return <Context.Provider value={data}>{children}</Context.Provider>;
}
export const useCatalogConfig = () => useContext(Context);
