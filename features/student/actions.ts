"use server";

import { redirect } from "next/navigation";
import { apiMutate } from "@/lib/api/server";
import { errorMessage } from "@/lib/api/errors";
import type { Attempt } from "@/types/api";

export interface StartAttemptState {
  error?: string;
}

export async function startAttemptFromLinkAction(
  _prev: StartAttemptState,
  formData: FormData,
): Promise<StartAttemptState> {
  const token = String(formData.get("token") ?? "");
  const maxAttempts = formData.get("maxAttempts") ? Number(formData.get("maxAttempts")) : null;

  let attempt: Attempt;
  try {
    attempt = await apiMutate<Attempt>(`/attempts/from-link/${token}`, { method: "POST" });
  } catch (error) {
    return { error: errorMessage(error, "Could not start this exam") };
  }
  redirect(`/exam/attempt/${attempt.id}${maxAttempts ? `?maxAttempts=${maxAttempts}` : ""}`);
}

/** Starting is idempotent — resuming just calls it again rather than tracking local "have I started" state. */
export async function resumeAttemptAction(quizId: string): Promise<void> {
  const attempt = await apiMutate<Attempt>(`/quizzes/${quizId}/attempts`, { method: "POST" });
  redirect(`/exam/attempt/${attempt.id}`);
}
