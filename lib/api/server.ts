import { cookies } from "next/headers";
import { apiRequest, apiRequestRaw, parseResponse } from "./client";
import type { ApiRequestOptions } from "./client";
import { ApiError } from "./errors";
import {
  ACCESS_COOKIE,
  DEVICE_COOKIE,
  ORG_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/session";
import type { TokenPair } from "@/types/api";

type CallOptions = Omit<ApiRequestOptions, "accessToken" | "deviceId">;

async function sessionHeaders() {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
    deviceId: jar.get(DEVICE_COOKIE)?.value ?? null,
    organizationId: jar.get(ORG_COOKIE)?.value ?? null,
  };
}

/**
 * Read path for Server Components. Cannot write cookies (React forbids it
 * during render), so a rotated token is not persisted here — `proxy.ts`
 * refreshes ahead of expiry, and a 401 that slips through surfaces as an
 * ApiError the route can redirect on.
 */
export async function api<T>(path: string, options: CallOptions = {}): Promise<T> {
  const session = await sessionHeaders();
  return apiRequest<T>(path, {
    ...options,
    accessToken: session.accessToken,
    deviceId: session.deviceId,
  });
}

/**
 * Write path for Server Actions and Route Handlers. Refreshes once on 401 and
 * persists the rotated pair, because here cookies *can* be written.
 */
export async function apiMutate<T>(
  path: string,
  options: CallOptions = {},
): Promise<T> {
  const session = await sessionHeaders();
  const response = await apiRequestRaw(path, {
    ...options,
    accessToken: session.accessToken,
    deviceId: session.deviceId,
  });

  if (response.status !== 401 || !session.refreshToken) {
    return parseResponse<T>(response);
  }

  const refreshed = await refreshTokens(
    session.refreshToken,
    session.organizationId,
    session.deviceId,
  );
  if (!refreshed) {
    throw new ApiError(401, "Your session has expired. Sign in again.");
  }

  return apiRequest<T>(path, {
    ...options,
    accessToken: refreshed.accessToken,
    deviceId: session.deviceId,
  });
}

/** Rotates the refresh token and writes both cookies. Returns null if it failed. */
export async function refreshTokens(
  refreshToken: string,
  organizationId: string | null,
  deviceId: string | null,
): Promise<TokenPair | null> {
  try {
    const tokens = await apiRequest<TokenPair>("/auth/refresh", {
      method: "POST",
      body: { refreshToken, ...(organizationId ? { organizationId } : {}) },
      deviceId,
    });
    const jar = await cookies();
    jar.set(ACCESS_COOKIE, tokens.accessToken, {
      ...accessCookieOptions,
      maxAge: tokens.accessTokenExpiresIn,
    });
    jar.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
    return tokens;
  } catch {
    return null;
  }
}

/** True when the caller has a session at all. */
export async function isAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(ACCESS_COOKIE)?.value);
}

export async function selectedOrganizationId(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ORG_COOKIE)?.value ?? null;
}
