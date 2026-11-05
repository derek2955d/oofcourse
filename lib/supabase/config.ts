// Validate configuration before constructing clients. Never log configuration values.
export function parseSupabaseConfig(rawUrl?: string, rawKey?: string) {
  const url = rawUrl?.trim(),
    key = rawKey?.trim();
  if (
    !url ||
    !key ||
    /[\s…]/.test(url) ||
    /[\s…]/.test(key) ||
    key.includes("...") ||
    key.includes("=sb_") ||
    key.startsWith("sb_secret_")
  )
    return null;
  try {
    const parsed = new URL(url);
    if (
      !["https:", "http:"].includes(parsed.protocol) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !["", "/"].includes(parsed.pathname) ||
      parsed.hostname.includes("...")
    )
      return null;
    return { url: parsed.origin, key };
  } catch {
    return null;
  }
}
export function supabaseConfig() {
  return parseSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
