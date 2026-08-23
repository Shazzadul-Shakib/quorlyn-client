import { api } from "@/lib/api/server";
import type { Attempt, QuizLinkPreview } from "@/types/api";

export async function getStudentAttempts(page = 1, limit = 20): Promise<Attempt[]> {
  return api<Attempt[]>(`/attempts/mine?page=${page}&limit=${limit}`);
}

export async function getQuizLinkPreview(token: string): Promise<QuizLinkPreview> {
  return api<QuizLinkPreview>(`/quiz-links/${token}`);
}
