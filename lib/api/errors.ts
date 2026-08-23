import type { ActiveDevice } from "@/types/api";

/**
 * One error type for every backend failure. `code` is only present on
 * responses that carry one (currently `DEVICE_CONFLICT`).
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isDeviceConflict(): boolean {
    return this.status === 409 && this.code === "DEVICE_CONFLICT";
  }

  /** 403 raised because no organization is selected in the token. */
  get needsOrganization(): boolean {
    return (
      this.status === 403 && this.message.startsWith("Select an organization")
    );
  }

  get activeDevice(): ActiveDevice | null {
    const device = (this.details as { activeDevice?: ActiveDevice } | undefined)
      ?.activeDevice;
    return device ?? null;
  }
}

interface NestErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: string;
}

/** Nest returns `message` as a string or an array of validation strings. */
export function toApiError(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const payload = body as NestErrorBody;
    const message = Array.isArray(payload.message)
      ? payload.message.join("\n")
      : (payload.message ?? payload.error ?? `Request failed (${status})`);
    return new ApiError(status, message, payload.code, body);
  }
  return new ApiError(status, `Request failed (${status})`);
}

export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
