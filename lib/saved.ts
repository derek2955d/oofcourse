export const SAVED_KEY = "oofcourse:saved:v1";
export function parseSaved(raw: string | null): string[] {
  try {
    const data = JSON.parse(raw || "[]");
    return Array.isArray(data)
      ? [
          ...new Set(
            data.filter(
              (x): x is string => typeof x === "string" && x.length < 100,
            ),
          ),
        ].slice(0, 200)
      : [];
  } catch {
    return [];
  }
}
