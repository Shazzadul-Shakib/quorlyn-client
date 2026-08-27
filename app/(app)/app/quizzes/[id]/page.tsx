import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getQuiz, getQuestions } from "@/features/quizzes/api";
import { QuizSettingsForm } from "@/features/quizzes/components/quiz-settings-form";
import { QuizLifecycleActions } from "@/features/quizzes/components/quiz-lifecycle-actions";
import { QuestionList, type QuestionListItem } from "@/features/quizzes/components/question-list";
import { RenderedContent } from "@/components/math/rendered-content";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { QuizStatusBadge } from "@/components/quiz-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { IconArrowLeft } from "@/components/ui/icons";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizEditorPage(props: PageProps<"/app/quizzes/[id]">) {
  const { id } = await props.params;
  // `getMe()`, `getQuiz()`, and `getQuestions()` each only need the session
  // cookie — none depends on another's result — so they run concurrently
  // instead of paying for `getMe()`'s round trip before the other two start.
  let me, quiz, questions;
  try {
    [me, quiz, questions] = await Promise.all([getMe(), getQuiz(id), getQuestions(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  requireOrgPermission(me.org, "MANAGE_QUIZZES");

  const questionRows: QuestionListItem[] = questions.map((question) => ({
    ...question,
    promptContent: <RenderedContent value={question.prompt} format={question.contentFormat} />,
    optionContent: Object.fromEntries(
      question.options.map((option) => [
        option.id,
        <RenderedContent key={option.id} value={option.text} format={question.contentFormat} />,
      ]),
    ),
  }));

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
        <QuestionList quizId={quiz.id} questions={questionRows} editable={quiz.status === "DRAFT"} />
      </div>
    </>
  );
}
