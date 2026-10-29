import { z } from "zod";

export const passwordChangeInput = z
  .object({
    current_password: z.string().max(128).default(""),
    password: z.string().min(12).max(128),
    confirm_password: z.string().min(12).max(128),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: "passwordSecurity.mismatch",
  })
  .refine(
    (value) =>
      !value.current_password || value.password !== value.current_password,
    { message: "passwordSecurity.different" },
  );

// Only call with claims returned by Supabase auth.getClaims(), after getUser().
// URL parameters, user metadata, and decoded-but-unverified JWTs are not proof.
export function hasRecentRecoveryAuthentication(
  claims: unknown,
  userId: string,
  now = Math.floor(Date.now() / 1000),
) {
  if (!claims || typeof claims !== "object") return false;
  const value = claims as Record<string, unknown>;
  if (
    value.sub !== userId ||
    typeof value.exp !== "number" ||
    value.exp <= now ||
    !Array.isArray(value.amr)
  )
    return false;
  return value.amr.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const { method, timestamp } = entry as Record<string, unknown>;
    return (
      ["otp", "recovery"].includes(String(method)) &&
      typeof timestamp === "number" &&
      Number.isInteger(timestamp) &&
      timestamp <= now &&
      now - timestamp <= 600
    );
  });
}

export async function verifiedPasswordUpdate(
  input: z.infer<typeof passwordChangeInput>,
  context: {
    userId: string;
    recentRecovery: boolean;
    verifyCurrent: (password: string) => Promise<string | null>;
    update: (password: string) => Promise<{ error?: string }>;
  },
) {
  if (!context.userId) return { error: "authRequired" };
  if (!context.recentRecovery || input.current_password) {
    if (!input.current_password)
      return { error: "passwordSecurity.currentRequired" };
    const identity = await context.verifyCurrent(input.current_password);
    if (!identity || identity !== context.userId)
      return { error: "passwordSecurity.currentInvalid" };
  }
  return context.update(input.password);
}

export function passwordUpdateError(code?: string) {
  if (code === "current_password_required")
    return "passwordSecurity.currentRequired";
  if (
    ["current_password_invalid", "current_password_mismatch"].includes(
      code || "",
    )
  )
    return "passwordSecurity.currentInvalid";
  if (code === "same_password") return "passwordSecurity.different";
  if (code === "weak_password") return "passwordSecurity.weak";
  return "passwordSecurity.updateFailed";
}
