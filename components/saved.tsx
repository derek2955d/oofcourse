"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Link from "@/components/localized-link";
import { useLocale } from "./locale-provider";
import { t } from "@/lib/i18n/messages";
import { parseSaved, SAVED_KEY } from "@/lib/saved";
type SavedState = {
  ids: string[];
  ready: boolean;
  error: string;
  toggle: (id: string) => void;
  clear: () => void;
};
const SavedContext = createContext<SavedState>({
  ids: [],
  ready: false,
  error: "",
  toggle: () => {},
  clear: () => {},
});
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [ids, setIds] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const load = () => {
      try {
        setIds(parseSaved(localStorage.getItem(SAVED_KEY)));
      } catch {
        setError(t(locale, "storageError"));
      }
      setReady(true);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [locale]);
  function update(next: string[]) {
    setIds(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      setError(
        "Could not save to this browser. Your selection will last only for this visit.",
      );
    }
  }
  return (
    <SavedContext.Provider
      value={{
        ids,
        ready,
        error,
        toggle: (id) =>
          update(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
        clear: () => update([]),
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}
export const useSaved = () => useContext(SavedContext);
export function SaveButton({
  id,
  name,
  full = false,
}: {
  id: string;
  name: string;
  full?: boolean;
}) {
  const locale = useLocale();
  const { ids, toggle, ready } = useSaved();
  const saved = ids.includes(id);
  return (
    <button
      type="button"
      className={`save-button ${full ? "save-full" : ""} ${saved ? "is-saved" : ""}`}
      disabled={!ready}
      aria-label={
        full
          ? `${t(locale, saved ? "savedFull" : "saveFull")}: ${name}${saved ? `. ${t(locale, "unsave")}` : ""}`
          : `${t(locale, saved ? "unsave" : "save")} ${name}`
      }
      aria-pressed={saved}
      onClick={() => toggle(id)}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {full && t(locale, saved ? "savedFull" : "saveFull")}
    </button>
  );
}
export function SavedNav() {
  const locale = useLocale();
  const { ids, ready } = useSaved();
  return (
    <Link href="/saved" className="saved-nav">
      <Heart size={19} />
      {t(locale, "saved")}
      {ready && ids.length > 0 && (
        <span className="saved-count">{ids.length}</span>
      )}
    </Link>
  );
}
