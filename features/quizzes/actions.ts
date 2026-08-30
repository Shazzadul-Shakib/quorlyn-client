"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as quizApi from "./api";
import type { DraftQuizSettings, PublishedQuizSettings, QuestionInput } from "./api";
import { errorMessage } from "@/lib/api/errors";
import type { AnswerKeyQuestion, Quiz, QuizLink } from "@/types/api";

export interface FormState {
  error?: string;
  notice?: string;
}

export async function createQuizAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes"));
  if (!title) return { error: "Title is required." };
  if (!durationMinutes || durationMinutes <= 0) return { error: "Duration is required." };

  let quiz: Quiz;
  try {
    quiz = await quizApi.createQuiz(title, durationMinutes * 60);
  } catch (error) {
    return { error: errorMessage(error, "Could not create the quiz") };
  }
  revalidatePath("/app/quizzes");
  redirect(`/app/quizzes/${quiz.id}`);
}

export async function updateDraftSettingsAction(
  quizId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const patch: Partial<DraftQuizSettings> = {
    title: get("title"),
    description: get("description") || null,
    language: get("language") as DraftQuizSettings["language"],
    subject: get("subject") || null,
    durationSeconds: Math.max(1, Number(get("durationSeconds")) || 0) * 60,
    opensAt: get("opensAt") ? new Date(get("opensAt")).toISOString() : null,
    closesAt: get("closesAt") ? new Date(get("closesAt")).toISOString() : null,
    maxAttempts: Math.max(1, Number(get("maxAttempts")) || 1),
    scoringPolicy: get("scoringPolicy") as DraftQuizSettings["scoringPolicy"],
    lateStartCutoff: formData.get("lateStartCutoff") === "on",
    shuffleQuestions: formData.get("shuffleQuestions") === "on",
    maxFocusViolations: get("maxFocusViolations") ? Number(get("maxFocusViolations")) : null,
    leaderboardVisibleToStudents: formData.get("leaderboardVisibleToStudents") === "on",
  };

  try {
    await quizApi.updateQuiz(quizId, patch);
  } catch (error) {
    return { error: errorMessage(error, "Could not save these settings") };
  }
  revalidatePath(`/app/quizzes/${quizId}`);
  return { notice: "Saved." };
}

export async function updatePublishedSettingsAction(
  quizId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const get = (key: string) => String(formData.get(key) ?? "").trim();
  const patch: PublishedQuizSettings = {
    title: get("title"),
    description: get("description") || null,
    opensAt: get("opensAt") ? new Date(get("opensAt")).toISOString() : null,
    closesAt: get("closesAt") ? new Date(get("closesAt")).toISOString() : null,
    maxFocusViolations: get("maxFocusViolations") ? Number(get("maxFocusViolations")) : null,
    leaderboardVisibleToStudents: formData.get("leaderboardVisibleToStudents") === "on",
  };

  try {
    await quizApi.updateQuiz(quizId, patch);
  } catch (error) {
    return { error: errorMessage(error, "Could not save these settings") };
  }
  revalidatePath(`/app/quizzes/${quizId}`);
  return { notice: "Saved." };
}

// These five all *return* `FormState` instead of throwing on failure —
// Next.js only forwards a thrown Server Action's real message to the client
// in dev; in production it's redacted to a generic one. Returning the error
// (same pattern as the settings/create actions above) means a real,
// expected rejection like "the availability window is too short" reaches
// the user identically in both environments.

export async function publishQuizAction(quizId: string): Promise<FormState> {
  try {
    await quizApi.publishQuiz(quizId);
  } catch (error) {
    return { error: errorMessage(error, "Could not publish this quiz") };
  }
  revalidatePath(`/app/quizzes/${quizId}`);
  return {};
}

export async function closeQuizAction(quizId: string): Promise<FormState> {
  try {
    await quizApi.closeQuiz(quizId);
  } catch (error) {
    return { error: errorMessage(error, "Could not close this quiz") };
  }
  revalidatePath(`/app/quizzes/${quizId}`);
  return {};
}

export async function archiveQuizAction(quizId: string): Promise<FormState> {
  try {
    await quizApi.archiveQuiz(quizId);
  } catch (error) {
    return { error: errorMessage(error, "Could not archive this quiz") };
  }
  revalidatePath(`/app/quizzes/${quizId}`);
  return {};
}

export async function duplicateQuizAction(quizId: string): Promise<FormState> {
  let duplicate: Quiz;
  try {
    duplicate = await quizApi.duplicateQuiz(quizId);
  } catch (error) {
    return { error: errorMessage(error, "Could not duplicate this quiz") };
  }
  // `redirect()` throws internally to do its work, so it must stay outside
  // the try/catch above — catching it there would swallow the navigation.
  revalidatePath("/app/quizzes");
  redirect(`/app/quizzes/${duplicate.id}`);
}

export async function deleteQuizAction(quizId: string): Promise<FormState> {
  try {
    await quizApi.deleteQuiz(quizId);
  } catch (error) {
    return { error: errorMessage(error, "Could not delete this quiz") };
  }
  revalidatePath("/app/quizzes");
  redirect("/app/quizzes");
}

export async function createQuestionAction(
  quizId: string,
  input: QuestionInput,
): Promise<AnswerKeyQuestion> {
  const question = await quizApi.createQuestion(quizId, input);
  revalidatePath(`/app/quizzes/${quizId}`);
  return question;
}

export async function updateQuestionAction(
  quizId: string,
  questionId: string,
  input: QuestionInput,
): Promise<AnswerKeyQuestion> {
  const question = await quizApi.updateQuestion(quizId, questionId, input);
  revalidatePath(`/app/quizzes/${quizId}`);
  return question;
}

export async function deleteQuestionAction(quizId: string, questionId: string): Promise<void> {
  await quizApi.deleteQuestion(quizId, questionId);
  revalidatePath(`/app/quizzes/${quizId}`);
}

export async function reorderQuestionsAction(
  quizId: string,
  questionIds: string[],
): Promise<void> {
  await quizApi.reorderQuestions(quizId, questionIds);
  revalidatePath(`/app/quizzes/${quizId}`);
}

export async function createLinkAction(
  quizId: string,
  input: { label?: string; expiresAt?: string; maxUses?: number },
): Promise<QuizLink> {
  const link = await quizApi.createLink(quizId, input);
  revalidatePath(`/app/quizzes/${quizId}/links`);
  return link;
}

export async function deleteLinkAction(quizId: string, linkId: string): Promise<void> {
  await quizApi.deleteLink(quizId, linkId);
  revalidatePath(`/app/quizzes/${quizId}/links`);
}
