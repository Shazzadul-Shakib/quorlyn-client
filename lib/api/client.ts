import { toApiError } from "./errors";

// Server-side only. Not guarded by the `server-only` package (an unasked
// dependency); the guard is that every caller also imports `next/headers`,
// which already fails the build inside a Client Component.

const API_URL = process.env.API_URL ?? "http://localhost:5000";
export const DEVICE_ID_HEADER = "X-Device-Id";

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string | null;
  deviceId?: string | null;
  /** Defaults to no-store: every response here is user-specific. */
  cache?: RequestCache;
  signal?: AbortSignal;
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers({ Accept: "application/json" });
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }
  if (options.deviceId) {
    headers.set(DEVICE_ID_HEADER, options.deviceId);
  }
  return headers;
}

/** Raw call — no session, no refresh. Used by the session layer and proxy. */
export async function apiRequestRaw(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  return fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(options),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: options.cache ?? "no-store",
    signal: options.signal,
  });
}

export async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  const payload: unknown = text.length > 0 ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }
  return payload as T;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return parseResponse<T>(await apiRequestRaw(path, options));
}
