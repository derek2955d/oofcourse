"use client";
import { createContext, useContext } from "react";
import { defaultTaxonomy, type Taxonomy } from "@/lib/taxonomy";
const StateContext = createContext("NY");
export const useDefaultState = () => useContext(StateContext);
const Context = createContext<Taxonomy>(defaultTaxonomy);
export function CatalogProvider({
  data,
  children,
  initialState = "NY",
}: {
  data: Taxonomy;
  initialState?: string;
  children: React.ReactNode;
}) {
  return (
    <StateContext.Provider value={initialState}>
      <Context.Provider value={data}>{children}</Context.Provider>
    </StateContext.Provider>
  );
}
export const useCatalogConfig = () => useContext(Context);
