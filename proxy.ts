import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!/^\/(en|zh)(\/|$)/.test(path)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${path === "/" ? "" : path}`;
    return NextResponse.redirect(url, 307);
  }
  let response = NextResponse.next({ request });
  // Refresh only administrator sessions. Each server action still checks user + role.
  if (
    /^\/(en|zh)\/admin(?:\/|$)/.test(path) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (values) => {
            for (const { name, value } of values)
              request.cookies.set(name, value);
            response = NextResponse.next({ request });
            for (const { name, value, options } of values)
              response.cookies.set(name, value, options);
          },
        },
      },
    );
    try {
      await client.auth.getUser();
    } catch {
      /* Protected page/actions deny access if authentication is unavailable. */
    }
  }
  return response;
}
export const config = {
  matcher: [
    "/((?!api|_next|icon.svg|robots.txt|sitemap.xml|manifest.webmanifest|images/|illustrations/|pwa/).*)",
  ],
};
