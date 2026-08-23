"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import { apiMutate } from "@/lib/api/server";
import {
  applyOrganizationSelection,
  clearSession,
  ensureDeviceId,
  readSession,
  startSession,
} from "@/lib/session";
import type {
  ActiveDevice,
  AuthTokens,
  SelectOrganizationResponse,
} from "@/types/api";

export interface AuthFormState {
  error?: string;
  notice?: string;
  /** Set when the backend refused because another device holds the session. */
  deviceConflict?: { email: string; activeDevice: ActiveDevice | null };
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/app";
}

/** A pure platform admin has nothing to pick — send them straight in, same rule as `app/(app)/layout.tsx`. */
function postAuthTarget(tokens: AuthTokens, next: string): string {
  if (tokens.org || tokens.user.platformRole === "SUPERADMIN") return next;
  return "/select-organization";
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));
  const deviceId = await ensureDeviceId();

  let tokens: AuthTokens;
  try {
    tokens = await apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: { email, password },
      deviceId,
    });
  } catch (error) {
    if (error instanceof ApiError && error.isDeviceConflict) {
      return {
        deviceConflict: { email, activeDevice: error.activeDevice },
      };
    }
    return { error: errorMessage(error, "Could not sign in") };
  }

  await startSession(tokens);
  redirect(postAuthTarget(tokens, next));
}

export async function requestDeviceChangeAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    await apiRequest<void>("/auth/device-change/request", {
      method: "POST",
      body: { email, password },
      deviceId: await ensureDeviceId(),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not send the code") };
  }
  return { notice: `We sent a six-digit code to ${email}. It expires in 10 minutes.` };
}

export async function verifyDeviceChangeAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const next = safeNext(formData.get("next"));

  let tokens: AuthTokens;
  try {
    tokens = await apiRequest<AuthTokens>("/auth/device-change/verify", {
      method: "POST",
      body: { email, password, code },
      deviceId: await ensureDeviceId(),
    });
  } catch (error) {
    return { error: errorMessage(error, "Could not verify that code") };
  }

  await startSession(tokens);
  redirect(postAuthTarget(tokens, next));
}

export async function selectOrganizationAction(
  organizationId: string,
  next = "/app",
): Promise<void> {
  const response = await apiMutate<SelectOrganizationResponse>(
    `/auth/organizations/${organizationId}/select`,
    { method: "POST" },
  );
  await applyOrganizationSelection(response);
  revalidatePath("/app", "layout");
  redirect(next.startsWith("/") ? next : "/app");
}

export async function logoutAction(): Promise<void> {
  const session = await readSession();
  if (session.refreshToken) {
    try {
      await apiMutate<void>("/auth/logout", {
        method: "POST",
        body: { refreshToken: session.refreshToken },
      });
    } catch {
      // Revoking server-side is best effort; the local session goes either way.
    }
  }
  await clearSession();
  redirect("/login");
}

export async function logoutEverywhereAction(): Promise<void> {
  try {
    await apiMutate<void>("/auth/logout-all", { method: "POST" });
  } catch {
    // Same as above.
  }
  await clearSession();
  redirect("/login");
}

export async function joinOrganizationAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const body = {
    joinCode: String(formData.get("joinCode") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };

  let tokens: AuthTokens;
  try {
    tokens = await apiRequest<AuthTokens>("/students/join", {
      method: "POST",
      body,
      deviceId: await ensureDeviceId(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.isDeviceConflict) {
      return { deviceConflict: { email: body.email, activeDevice: error.activeDevice } };
    }
    return { error: errorMessage(error, "Could not join with that code") };
  }

  await startSession(tokens);
  redirect("/app");
}

export async function acceptInviteAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  let tokens: AuthTokens;
  try {
    tokens = await apiRequest<AuthTokens>("/invites/accept", {
      method: "POST",
      body: { token, password },
      deviceId: await ensureDeviceId(),
    });
  } catch (error) {
    if (error instanceof ApiError && error.isDeviceConflict) {
      return {
        deviceConflict: {
          email: String(formData.get("email") ?? ""),
          activeDevice: error.activeDevice,
        },
      };
    }
    return { error: errorMessage(error, "Could not accept this invite") };
  }

  await startSession(tokens);
  redirect("/app");
}
