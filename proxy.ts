import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { activeState } from "./lib/geography";
import { supabaseConfig } from "./lib/supabase/config";
import { sessionCookieOptions } from "./lib/supabase/cookie-policy";
export default async function proxy(request: NextRequest) {
  const requestedState = request.nextUrl.searchParams.get("state");
  if (requestedState && requestedState !== activeState(requestedState)) {
    const url = request.nextUrl.clone();
    url.searchParams.set("state", activeState(requestedState));
    url.searchParams.delete("location");
    url.searchParams.delete("page");
    return NextResponse.redirect(url);
  }
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
        cookieOptions: sessionCookieOptions({
          vercel: process.env.VERCEL,
          protocol: request.nextUrl.protocol,
          forwardedProto: request.headers.get("x-forwarded-proto"),
        }),
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
