import { api } from "@/lib/api/server";
import type { Attempt, AttemptDetail, Leaderboard, QuizDashboard } from "@/types/api";

export async function listAttempts(quizId: string, page = 1, limit = 20): Promise<Attempt[]> {
  return api<Attempt[]>(`/quizzes/${quizId}/attempts?page=${page}&limit=${limit}`);
}

export async function getAttemptDetail(attemptId: string): Promise<AttemptDetail> {
  return api<AttemptDetail>(`/attempts/${attemptId}/detail`);
}

export async function getLeaderboard(
  quizId: string,
  page = 1,
  limit = 20,
): Promise<Leaderboard> {
  return api<Leaderboard>(`/quizzes/${quizId}/leaderboard?page=${page}&limit=${limit}`);
}

export async function getQuizDashboard(quizId: string): Promise<QuizDashboard> {
  return api<QuizDashboard>(`/dashboard/quizzes/${quizId}`);
}
