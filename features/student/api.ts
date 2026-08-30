import { api } from "@/lib/api/server";
import type { Attempt, AttemptReview, QuizLinkPreview } from "@/types/api";

export async function getStudentAttempts(page = 1, limit = 20): Promise<Attempt[]> {
  return api<Attempt[]>(`/attempts/mine?page=${page}&limit=${limit}`);
}

/** 403s until the quiz has closed — the caller decides whether to link here. */
export async function getAttemptReview(attemptId: string): Promise<AttemptReview> {
  return api<AttemptReview>(`/attempts/${attemptId}/review`);
}

export async function getQuizLinkPreview(token: string): Promise<QuizLinkPreview> {
  return api<QuizLinkPreview>(`/quiz-links/${token}`);
}
