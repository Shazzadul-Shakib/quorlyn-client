import { NextResponse } from "next/server";
import { ApiError } from "./errors";

/**
 * Route Handlers under `app/api/` proxy the exam runner's client-side loops
 * (heartbeat, autosave, events, submit) to the backend using the session
 * cookie, so the browser never holds a token. This maps a failed proxy call
 * back into a response the client's own error handling already understands.
 */
export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { statusCode: error.status, message: error.message, code: error.code },
      { status: error.status },
    );
  }
  return NextResponse.json({ statusCode: 500, message: "Unexpected error" }, { status: 500 });
}
