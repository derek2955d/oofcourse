export function safeNext(value: unknown) {
  return typeof value === "string" &&
    /^\/(account|post|saved|admin)(\/|\?|$)/.test(value) &&
    !/[\\\r\n]/.test(value)
    ? value
    : "/account";
}
export function siteOrigin() {
  const raw =
    process.env.SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const u = new URL(raw);
  if (
    u.protocol !== "https:" &&
    !(u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname))
  )
    throw new Error("setupMessage");
  return u.origin;
}
export function uploadSignature(bytes: Uint8Array, mime: string) {
  return mime === "image/jpeg"
    ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : mime === "image/png"
      ? [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
      : mime === "image/webp"
        ? String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
          String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
        : false;
}
