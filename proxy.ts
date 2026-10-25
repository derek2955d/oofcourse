import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { supabaseConfig } from "./lib/supabase/config";
export default async function proxy(request: NextRequest) {
  const response = createMiddleware(routing)(request);
  const connection = supabaseConfig();
  if (
    (/^\/(en|zh)\/(account|admin|post|saved|login|signup|reset-password)/.test(
      request.nextUrl.pathname,
    ) ||
      request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) &&
    connection
  ) {
    try {
      const client = createServerClient(connection.url, connection.key, {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (items) => {
            for (const { name, value, options } of items) {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            }
          },
        },
      });
      await client.auth.getUser();
    } catch {
      /* Protected actions still fail closed. */
    }
  }
  return response;
}
export const config = { matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"] };
