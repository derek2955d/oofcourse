/** Server-owned sessions: readable by the server, never by page JavaScript. */
export function sessionCookieOptions(
  context: {
    vercel?: string;
    forwardedProto?: string | null;
    protocol?: string;
  } = {},
) {
  const forwarded = context.forwardedProto?.split(",")[0].trim().toLowerCase();
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    // Vercel is HTTPS-only; a supplied HTTP header cannot downgrade its cookies.
    // Local production-build tests still work over plain HTTP.
    secure:
      context.vercel === "1" ||
      context.protocol === "https:" ||
      forwarded === "https",
  };
}
