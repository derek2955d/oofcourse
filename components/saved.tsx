"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
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
  const [ids, setIds] = useState<string[]>([]),
    [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const load = () => {
      try {
        setIds(parseSaved(localStorage.getItem(SAVED_KEY)));
      } catch {
        setError(
          "Browser storage is unavailable. Saved finds will last only for this visit.",
        );
      }
      setReady(true);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);
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
  const { ids, toggle, ready } = useSaved();
  const saved = ids.includes(id);
  return (
    <button
      type="button"
      className={`save-button ${full ? "save-full" : ""} ${saved ? "is-saved" : ""}`}
      disabled={!ready}
      aria-label={
        full
          ? `${saved ? "Saved to your finds" : "Save this find"}: ${name}${saved ? ". Unsave" : ""}`
          : `${saved ? "Unsave" : "Save"} ${name}`
      }
      aria-pressed={saved}
      onClick={() => toggle(id)}
    >
      <Heart size={18} fill={saved ? "currentColor" : "none"} />
      {full && (saved ? "Saved to your finds" : "Save this find")}
    </button>
  );
}
export function SavedNav() {
  const { ids, ready } = useSaved();
  return (
    <Link href="/saved" className="saved-nav">
      <Heart size={19} />
      Saved
      {ready && ids.length > 0 && (
        <span className="saved-count">{ids.length}</span>
      )}
    </Link>
  );
}
