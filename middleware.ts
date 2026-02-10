import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Canonicalize URLs to avoid duplicated route trees:
// - `/prom/*` is an alias of the root routes -> redirect to `/*`
// - `/streamers/:id` (viewer detail) -> redirect to `/streamer/:id`
//
// Keep `/legacy/*` as-is (separate UI).

const STREAMER_ID_RE = /^\/streamers\/(\d+)\/?$/;
const HAS_FILE_EXTENSION_RE = /\.[a-z0-9]+$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/prom" || pathname.startsWith("/prom/")) {
    // Do not canonicalize static assets served from `public/prom/*`.
    if (HAS_FILE_EXTENSION_RE.test(pathname)) {
      return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    const rest = pathname.slice("/prom".length) || "/";
    url.pathname = rest;
    return NextResponse.redirect(url, 308);
  }

  const m = pathname.match(STREAMER_ID_RE);
  if (m) {
    const url = request.nextUrl.clone();
    url.pathname = `/streamer/${m[1]}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes and Next internals/assets.
    "/((?!api|_next/static|_next/image|favicon.ico|icon\\.svg|apple-icon\\.png).*)",
  ],
};
