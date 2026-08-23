import { cache } from "react";
import { api } from "@/lib/api/server";
import type { MeResponse } from "@/types/api";

/**
 * `cache()` dedupes this within one render pass, so the layout and a page
 * that both need `me` only trigger one request to the backend.
 */
export const getMe = cache(async (): Promise<MeResponse> => {
  return api<MeResponse>("/auth/me");
});
