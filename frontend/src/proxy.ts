import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { roleSegment } from "@/shared/utils/role.utils";

import { locales } from "./i18n/config";
import {
  decodeSession,
  homePath,
  ORG_COOKIE,
  parseOrgRolePath,
  pickDefaultRole,
  type Session
} from "./lib/routing";
import { routing } from "./navigation";

const intl = createMiddleware(routing);

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/register-organization",
  "/forgot-password"
];
const OPEN_ROUTES = ["/reset-password"];
const NO_ORG_ROUTE = "/no-org-access";

const BACKEND_URL =
  process.env.INTERNAL_BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;

const matches = (routes: string[], path: string) =>
  routes.some(route => path === route || path.startsWith(`${route}/`));

async function resolveSession(
  request: NextRequest
): Promise<{ session: Session | null; setCookies: string[] }> {
  const session = decodeSession(request.cookies.get("access_token")?.value);
  if (session) return { session, setCookies: [] };

  const refreshToken = request.cookies.get("refresh_token")?.value;
  if (!refreshToken) return { session: null, setCookies: [] };

  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: "no-store"
    });
    const setCookies = response.headers.getSetCookie();
    if (!response.ok) return { session: null, setCookies };

    const accessToken = setCookies
      .map(cookie => /^access_token=([^;]+)/.exec(cookie)?.[1])
      .find(Boolean);
    return {
      session: decodeSession(
        accessToken ? decodeURIComponent(accessToken) : undefined
      ),
      setCookies
    };
  } catch {
    return { session: null, setCookies: [] };
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const locale = locales.find(
    l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (!locale) return intl(request);

  const path = pathname.slice(locale.length + 1) || "/";
  if (matches(OPEN_ROUTES, path)) return intl(request);

  const { session, setCookies } = await resolveSession(request);

  const withCookies = (response: NextResponse) => {
    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }
    return response;
  };
  const redirectTo = (target: string) =>
    withCookies(NextResponse.redirect(new URL(target, request.url)));
  const home = (s: Session) =>
    homePath(
      locale,
      pickDefaultRole(s.roles, request.cookies.get(ORG_COOKIE)?.value)
    );

  if (matches(AUTH_ROUTES, path)) {
    return session?.roles.length
      ? redirectTo(home(session))
      : withCookies(intl(request));
  }

  if (!session) return redirectTo(`/${locale}/login`);

  if (!session.roles.length) {
    return path === NO_ORG_ROUTE
      ? withCookies(intl(request))
      : redirectTo(`/${locale}${NO_ORG_ROUTE}`);
  }

  const target = parseOrgRolePath(path);
  if (target) {
    const membership = session.roles.find(r => r.orgSlug === target.orgSlug);
    if (membership && roleSegment(membership.role) === target.segment) {
      return withCookies(intl(request));
    }
    if (membership) return redirectTo(homePath(locale, membership));
  }

  return redirectTo(home(session));
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
