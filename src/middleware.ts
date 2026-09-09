import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, parseGateSession } from "@/lib/gate/session";
import { isLocale, LANG_COOKIE, localeFromGeo } from "@/lib/i18n/config";

function detectLocale(request: NextRequest) {
  const cookie = request.cookies.get(LANG_COOKIE)?.value;
  if (isLocale(cookie)) return cookie;
  return localeFromGeo(
    request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry"),
    request.headers.get("x-vercel-ip-country-region"),
  );
}

function withLocale(request: NextRequest, response: NextResponse) {
  const cookie = request.cookies.get(LANG_COOKIE)?.value;
  const locale = detectLocale(request);
  if (!isLocale(cookie) && (locale === "it" || locale === "es")) {
    response.cookies.set(LANG_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  return response;
}

function nextWithLocale(request: NextRequest) {
  const locale = detectLocale(request);
  const headers = new Headers(request.headers);
  headers.set("x-jeric-lang", locale);
  return withLocale(request, NextResponse.next({ request: { headers } }));
}

const REDIRECTS: Record<string, string> = {
  "/lounge": "/",
  "/lounge/login": "/join",
  "/lounge/community": "/",
  "/lounge/games": "/play",
  "/lounge/members": "/",
  "/lounge/discussions": "/",
  "/lounge/travel": "/rides",
  "/lounge/groups": "/",
  "/lounge/challenges": "/play",
  "/lounge/leaderboard": "/leaderboard",
  "/lounge/profile": "/me",
  "/lounge/messages": "/",
  "/portal": "/",
  "/portal/login": "/join",
  "/portal/rides": "/rides",
  "/portal/boards": "/",
  "/portal/profile": "/me",
  "/guestbook": "/",
  "/updates": "/",
  "/enter": "/",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/lounge/games/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/play";
    return withLocale(request, NextResponse.redirect(url));
  }

  if (pathname.startsWith("/lounge/discussions/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return withLocale(request, NextResponse.redirect(url));
  }

  if (pathname.startsWith("/portal/boards/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return withLocale(request, NextResponse.redirect(url));
  }

  const destination = REDIRECTS[pathname];
  if (destination) {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return withLocale(request, NextResponse.redirect(url));
  }

  const session = parseGateSession(request.cookies.get(GATE_COOKIE)?.value);
  const publicPath =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname === "/admin" ||
    pathname === "/unsubscribe" ||
    pathname.startsWith("/api/");
  if (!session && !publicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    url.searchParams.set("next", pathname);
    return withLocale(request, NextResponse.redirect(url));
  }

  return nextWithLocale(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
