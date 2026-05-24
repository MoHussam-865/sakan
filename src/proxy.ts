import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function proxy(request: NextRequest) {
  // ── 1. Supabase session refresh ──────────────────────────────────────────
  // We need to call supabase.auth.getUser() on every request so the SSR
  // client can rotate the session cookie before it expires.
  // Start with a plain pass-through response that Supabase can attach cookies to.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Mutate the request cookies so downstream reads are consistent.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response so the new cookies are forwarded to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session; never trust the client-side token alone.
  await supabase.auth.getUser();

  // ── 2. next-intl locale routing ──────────────────────────────────────────
  const intlResponse = intlMiddleware(request);

  // Copy any Supabase auth cookies onto the intl response so they reach the browser.
  response.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  // Run on all paths except Next.js internals, static assets, and API routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
