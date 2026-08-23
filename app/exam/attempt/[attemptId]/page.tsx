import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api/server";
import { ExamRunner } from "@/features/exam/components/exam-runner";
import { ApiError } from "@/lib/api/errors";
import type { ExamState } from "@/types/api";

export const metadata: Metadata = { title: "Exam" };

export default async function ExamAttemptPage(props: PageProps<"/exam/attempt/[attemptId]">) {
  const { attemptId } = await props.params;
  const { maxAttempts } = await props.searchParams;

  let state: ExamState;
  try {
    state = await api<ExamState>(`/attempts/${attemptId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const max = typeof maxAttempts === "string" ? Number(maxAttempts) : null;
  const attemptsLeftLabel =
    max && max > 0 ? `Attempt ${state.attempt.attemptNumber} of ${max}` : undefined;

  return <ExamRunner initial={state} attemptsLeftLabel={attemptsLeftLabel} />;
}
