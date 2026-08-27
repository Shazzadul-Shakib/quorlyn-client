import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { api } from "@/lib/api/server";
import { ExamRunner } from "@/features/exam/components/exam-runner";
import type { ExamQuestionContent } from "@/features/exam/components/exam-question-card";
import { RenderedContent } from "@/components/math/rendered-content";
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

  // Every question is already known up front (the exam runner switches
  // between them client-side, with no per-question server round trip), so
  // the math in each one renders here, once, on the server — the runner's
  // "use client" tree only ever receives finished markup, never raw LaTeX
  // or the MathLive engine needed to convert it.
  const content: Record<string, ExamQuestionContent> = Object.fromEntries(
    state.questions.map((question) => [
      question.id,
      {
        promptContent: <RenderedContent value={question.prompt} format={question.contentFormat} />,
        optionContent: Object.fromEntries(
          question.options.map((option) => [
            option.id,
            <RenderedContent key={option.id} value={option.text} format={question.contentFormat} />,
          ]),
        ),
      } satisfies ExamQuestionContent,
    ]),
  );

  return <ExamRunner initial={state} content={content} attemptsLeftLabel={attemptsLeftLabel} />;
}
