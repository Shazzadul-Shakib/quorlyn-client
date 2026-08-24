import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getQuiz, getQuestions } from "@/features/quizzes/api";
import { QuizSettingsForm } from "@/features/quizzes/components/quiz-settings-form";
import { QuizLifecycleActions } from "@/features/quizzes/components/quiz-lifecycle-actions";
import { QuestionList } from "@/features/quizzes/components/question-list";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { QuizStatusBadge } from "@/components/quiz-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/ui/icons";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizEditorPage(props: PageProps<"/app/quizzes/[id]">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_QUIZZES");

  const { id } = await props.params;
  let quiz;
  let questions;
  try {
    [quiz, questions] = await Promise.all([getQuiz(id), getQuestions(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={quiz.title}
        breadcrumb={
          <Link href="/app/quizzes" className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> Quizzes
          </Link>
        }
        description={
          <span className="flex items-center gap-2">
            <QuizStatusBadge status={quiz.status} />
            <span>
              {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"} · {quiz.totalPoints} pts
            </span>
            <span className="text-fg-subtle">· Created by {quiz.createdByEmail}</span>
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <ButtonLink href={`/app/quizzes/${quiz.id}/results`} variant="secondary" size="sm">
              Results
            </ButtonLink>
            <ButtonLink href={`/app/quizzes/${quiz.id}/links`} variant="secondary" size="sm">
              Links
            </ButtonLink>
            <QuizLifecycleActions quiz={quiz} />
          </div>
        }
      />

      <Card>
        <CardHeader title="Settings" />
        <CardBody>
          <QuizSettingsForm quiz={quiz} />
        </CardBody>
      </Card>

      <div className="space-y-2.5">
        <div>
          <h2 className="text-fg text-sm font-semibold">Questions</h2>
          {quiz.status === "DRAFT" ? (
            <p className="text-fg-subtle text-xs">
              Write the prompt, insert a formula with the Formula button when you need one, then
              add options and mark the correct answer.
            </p>
          ) : null}
        </div>
        <QuestionList quizId={quiz.id} questions={questions} editable={quiz.status === "DRAFT"} />
      </div>
    </>
  );
}
