import { cookies } from "next/headers";
import type { AuthTokens, SelectOrganizationResponse } from "@/types/api";

export const ACCESS_COOKIE = "qr_at";
export const REFRESH_COOKIE = "qr_rt";
export const ORG_COOKIE = "qr_org";
export const DEVICE_COOKIE = "qr_did";

/** Tokens are httpOnly so no client script — ours or an injected one — can read them. */
const BASE_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // matches REFRESH_TOKEN_TTL_DAYS
const DEVICE_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export interface Session {
  accessToken: string | null;
  refreshToken: string | null;
  organizationId: string | null;
  deviceId: string | null;
}

export async function readSession(): Promise<Session> {
  const jar = await cookies();
  return {
    accessToken: jar.get(ACCESS_COOKIE)?.value ?? null,
    refreshToken: jar.get(REFRESH_COOKIE)?.value ?? null,
    organizationId: jar.get(ORG_COOKIE)?.value ?? null,
    deviceId: jar.get(DEVICE_COOKIE)?.value ?? null,
  };
}

/** Only callable from a Server Action or Route Handler. */
export async function writeAuthTokens(tokens: {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresIn: number;
}): Promise<void> {
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, tokens.accessToken, {
    ...BASE_COOKIE,
    maxAge: tokens.accessTokenExpiresIn,
  });
  if (tokens.refreshToken) {
    jar.set(REFRESH_COOKIE, tokens.refreshToken, {
      ...BASE_COOKIE,
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function writeSelectedOrganization(
  organizationId: string | null,
): Promise<void> {
  const jar = await cookies();
  if (organizationId === null) {
    jar.delete(ORG_COOKIE);
    return;
  }
  jar.set(ORG_COOKIE, organizationId, {
    ...BASE_COOKIE,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function startSession(tokens: AuthTokens): Promise<void> {
  await writeAuthTokens(tokens);
  await writeSelectedOrganization(tokens.org?.id ?? null);
}

export async function applyOrganizationSelection(
  response: SelectOrganizationResponse,
): Promise<void> {
  await writeAuthTokens({
    accessToken: response.accessToken,
    accessTokenExpiresIn: response.accessTokenExpiresIn,
  });
  await writeSelectedOrganization(response.org.id);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(ORG_COOKIE);
}

export async function ensureDeviceId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(DEVICE_COOKIE)?.value;
  if (existing) return existing;

  const deviceId = crypto.randomUUID();
  jar.set(DEVICE_COOKIE, deviceId, { ...BASE_COOKIE, maxAge: DEVICE_MAX_AGE });
  return deviceId;
}

export const deviceCookieOptions = {
  ...BASE_COOKIE,
  maxAge: DEVICE_MAX_AGE,
};

export const accessCookieOptions = BASE_COOKIE;
export const refreshCookieOptions = { ...BASE_COOKIE, maxAge: REFRESH_MAX_AGE };

/** Seconds until the access token expires, from its `exp` claim. */
export function accessTokenTtl(token: string | null | undefined): number {
  if (!token) return -1;
  const segments = token.split(".");
  if (segments.length < 2) return -1;
  try {
    const payload = JSON.parse(
      Buffer.from(segments[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    if (typeof payload.exp !== "number") return -1;
    return payload.exp - Math.floor(Date.now() / 1000);
  } catch {
    return -1;
  }
}
