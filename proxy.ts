import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  DEVICE_COOKIE,
  ORG_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  accessTokenTtl,
  deviceCookieOptions,
  refreshCookieOptions,
} from "@/lib/session";
import { apiRequestRaw } from "@/lib/api/client";
import type { TokenPair } from "@/types/api";

/** Refresh this many seconds before the access token actually expires. */
const REFRESH_SKEW_SECONDS = 90;

/** Reachable without a session. */
const PUBLIC_PREFIXES = ["/login", "/device-change", "/join", "/invite"];

/** The link-landing page, `/exam/{token}` — exactly one segment, so this
 * never matches `/exam/attempt/{attemptId}`, which stays behind auth. */
const EXAM_LINK_PATTERN = /^\/exam\/[^/]+$/;

function isPublic(pathname: string): boolean {
  return (
    pathname === "/" ||
    EXAM_LINK_PATTERN.test(pathname) ||
    PUBLIC_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const deviceId = request.cookies.get(DEVICE_COOKIE)?.value ?? crypto.randomUUID();
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value ?? null;
  let accessToken = request.cookies.get(ACCESS_COOKIE)?.value ?? null;
  let rotated: TokenPair | null = null;

  // Renew ahead of expiry so a Server Component render never meets a 401 —
  // it could not write the rotated cookie back anyway.
  if (refreshToken && accessTokenTtl(accessToken) < REFRESH_SKEW_SECONDS) {
    rotated = await rotate(
      refreshToken,
      request.cookies.get(ORG_COOKIE)?.value ?? null,
      deviceId,
    );
    accessToken = rotated?.accessToken ?? null;
  }

  const authenticated = Boolean(accessToken);

  if (!authenticated && !isPublic(pathname)) {
    const target = new URL("/login", request.url);
    target.searchParams.set("next", `${pathname}${search}`);
    return finish(NextResponse.redirect(target), request, deviceId, rotated, accessToken);
  }

  if (authenticated && (pathname === "/login" || pathname === "/")) {
    return finish(
      NextResponse.redirect(new URL("/app", request.url)),
      request,
      deviceId,
      rotated,
      accessToken,
    );
  }

  // Pass the fresh cookie down to this same render, not just to the browser.
  const headers = new Headers(request.headers);
  const jar = new Map(
    request.cookies.getAll().map((cookie) => [cookie.name, cookie.value]),
  );
  jar.set(DEVICE_COOKIE, deviceId);
  if (rotated) {
    jar.set(ACCESS_COOKIE, rotated.accessToken);
    jar.set(REFRESH_COOKIE, rotated.refreshToken);
  } else if (!accessToken) {
    jar.delete(ACCESS_COOKIE);
  }
  headers.set(
    "cookie",
    [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; "),
  );

  return finish(
    NextResponse.next({ request: { headers } }),
    request,
    deviceId,
    rotated,
    accessToken,
  );
}

function finish(
  response: NextResponse,
  request: NextRequest,
  deviceId: string,
  rotated: TokenPair | null,
  accessToken: string | null,
): NextResponse {
  if (request.cookies.get(DEVICE_COOKIE)?.value !== deviceId) {
    response.cookies.set(DEVICE_COOKIE, deviceId, deviceCookieOptions);
  }
  if (rotated) {
    response.cookies.set(ACCESS_COOKIE, rotated.accessToken, {
      ...accessCookieOptions,
      maxAge: rotated.accessTokenExpiresIn,
    });
    response.cookies.set(REFRESH_COOKIE, rotated.refreshToken, refreshCookieOptions);
  } else if (!accessToken && request.cookies.get(ACCESS_COOKIE)) {
    // The refresh failed: drop the dead session rather than looping on 401s.
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
  }
  return response;
}

async function rotate(
  refreshToken: string,
  organizationId: string | null,
  deviceId: string,
): Promise<TokenPair | null> {
  try {
    const response = await apiRequestRaw("/auth/refresh", {
      method: "POST",
      body: { refreshToken, ...(organizationId ? { organizationId } : {}) },
      deviceId,
    });
    if (!response.ok) return null;
    return (await response.json()) as TokenPair;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|mathlive|favicon.ico).*)"],
};
