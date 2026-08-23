import { api, apiMutate } from "@/lib/api/server";
import type {
  AnswerKeyQuestion,
  ContentFormat,
  Paginated,
  Quiz,
  QuizLink,
  QuizStatus,
  QuestionType,
  ScoringPolicy,
} from "@/types/api";

export interface QuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface QuestionInput {
  type: QuestionType;
  prompt: string;
  contentFormat: ContentFormat;
  points: number;
  options: QuestionOptionInput[];
}

/** Only these settle before publish; PATCH after publish accepts a smaller set (see `updateQuiz`). */
export interface DraftQuizSettings {
  title: string;
  description: string | null;
  language: Quiz["language"];
  subject: string | null;
  durationSeconds: number;
  opensAt: string | null;
  closesAt: string | null;
  maxAttempts: number;
  scoringPolicy: ScoringPolicy;
  lateStartCutoff: boolean;
  shuffleQuestions: boolean;
  maxFocusViolations: number | null;
  leaderboardVisibleToStudents: boolean;
}

/** The subset PATCHable once a quiz is published — anything else 409s. */
export interface PublishedQuizSettings {
  title?: string;
  description?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  leaderboardVisibleToStudents?: boolean;
  maxFocusViolations?: number | null;
}

export async function listQuizzes(params: {
  status?: QuizStatus;
  mine?: boolean;
  page?: number;
  limit?: number;
}): Promise<Paginated<Quiz>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.mine) query.set("mine", "true");
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return api<Paginated<Quiz>>(`/quizzes?${query.toString()}`);
}

export async function getQuiz(id: string): Promise<Quiz> {
  return api<Quiz>(`/quizzes/${id}`);
}

export async function createQuiz(title: string, durationSeconds: number): Promise<Quiz> {
  return apiMutate<Quiz>("/quizzes", { method: "POST", body: { title, durationSeconds } });
}

export async function updateQuiz(
  id: string,
  patch: Partial<DraftQuizSettings> | PublishedQuizSettings,
): Promise<Quiz> {
  return apiMutate<Quiz>(`/quizzes/${id}`, { method: "PATCH", body: patch });
}

export async function deleteQuiz(id: string): Promise<void> {
  return apiMutate<void>(`/quizzes/${id}`, { method: "DELETE" });
}

export async function publishQuiz(id: string): Promise<Quiz> {
  return apiMutate<Quiz>(`/quizzes/${id}/publish`, { method: "POST" });
}

export async function closeQuiz(id: string): Promise<Quiz> {
  return apiMutate<Quiz>(`/quizzes/${id}/close`, { method: "POST" });
}

export async function archiveQuiz(id: string): Promise<Quiz> {
  return apiMutate<Quiz>(`/quizzes/${id}/archive`, { method: "POST" });
}

export async function duplicateQuiz(id: string): Promise<Quiz> {
  return apiMutate<Quiz>(`/quizzes/${id}/duplicate`, { method: "POST" });
}

export async function getQuestions(quizId: string): Promise<AnswerKeyQuestion[]> {
  return api<AnswerKeyQuestion[]>(`/quizzes/${quizId}/questions`);
}

/** Same shape as the authoring view; gated on `VIEW_RESULTS` instead of `MANAGE_QUIZZES`. */
export async function getAnswerKey(quizId: string): Promise<AnswerKeyQuestion[]> {
  return api<AnswerKeyQuestion[]>(`/quizzes/${quizId}/answer-key`);
}

export async function createQuestion(
  quizId: string,
  input: QuestionInput,
): Promise<AnswerKeyQuestion> {
  return apiMutate<AnswerKeyQuestion>(`/quizzes/${quizId}/questions`, {
    method: "POST",
    body: input,
  });
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  input: QuestionInput,
): Promise<AnswerKeyQuestion> {
  return apiMutate<AnswerKeyQuestion>(`/quizzes/${quizId}/questions/${questionId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deleteQuestion(quizId: string, questionId: string): Promise<void> {
  return apiMutate<void>(`/quizzes/${quizId}/questions/${questionId}`, { method: "DELETE" });
}

export async function reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
  return apiMutate<void>(`/quizzes/${quizId}/questions/order`, {
    method: "PUT",
    body: { questionIds },
  });
}

export async function listLinks(quizId: string): Promise<QuizLink[]> {
  return api<QuizLink[]>(`/quizzes/${quizId}/links`);
}

export async function createLink(
  quizId: string,
  input: { label?: string; expiresAt?: string; maxUses?: number },
): Promise<QuizLink> {
  return apiMutate<QuizLink>(`/quizzes/${quizId}/links`, { method: "POST", body: input });
}

export async function revokeLink(quizId: string, linkId: string): Promise<void> {
  return apiMutate<void>(`/quizzes/${quizId}/links/${linkId}`, { method: "DELETE" });
}
