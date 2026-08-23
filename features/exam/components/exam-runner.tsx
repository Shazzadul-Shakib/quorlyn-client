"use client";

import { useMemo, useState } from "react";
import { useExamRunner } from "../use-exam-runner";
import { CountdownBadge } from "./countdown-badge";
import { QuestionNav } from "./question-nav";
import { ExamQuestionCard } from "./exam-question-card";
import { ResultScreen } from "./result-screen";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody } from "@/components/ui/card";
import { Brand } from "@/components/brand";
import { useConfirm } from "@/components/ui/confirm-provider";
import { errorMessage } from "@/lib/api/errors";
import type { ExamState } from "@/types/api";

export function ExamRunner({
  initial,
  attemptsLeftLabel,
}: {
  initial: ExamState;
  attemptsLeftLabel?: string;
}) {
  const runner = useExamRunner(initial);
  const [index, setIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const confirm = useConfirm();

  const questionIds = useMemo(() => runner.questions.map((q) => q.id), [runner.questions]);
  const answeredIndex = useMemo(() => {
    const set = new Set<number>();
    runner.questions.forEach((question, i) => {
      if ((runner.answers[question.id] ?? []).length > 0) set.add(i);
    });
    return set;
  }, [runner.questions, runner.answers]);

  if (runner.attempt.status === "SUBMITTED") {
    return <ResultScreen attempt={runner.attempt} attemptsLeftLabel={attemptsLeftLabel} />;
  }

  if (!runner.started) {
    return (
      <div className="bg-exam-canvas flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <Brand href="/app" />
        <Card className="w-full max-w-md">
          <CardBody className="space-y-4 p-8">
            <h1 className="text-fg text-xl font-semibold">{runner.attempt.quizTitle}</h1>
            <p className="text-fg-muted text-sm">
              {runner.questions.length} question{runner.questions.length === 1 ? "" : "s"} ·{" "}
              {runner.attempt.maxScore} points. Once you begin, the exam goes full-screen and the
              clock starts — leaving the exam screen is recorded.
            </p>
            <Button onClick={runner.begin} className="w-full" size="lg">
              Begin exam
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const current = runner.questions[index];

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(runner.questions.length - 1, next)));
  }

  async function handleSubmit() {
    const unanswered = runner.questions
      .map((question, i) => ({ question, i }))
      .filter(({ question }) => (runner.answers[question.id] ?? []).length === 0);
    const ok = await confirm({
      title: "Submit your answers?",
      description:
        unanswered.length > 0
          ? `${unanswered.length} unanswered question${unanswered.length === 1 ? "" : "s"} (${unanswered
              .map(({ i }) => i + 1)
              .join(", ")}). This cannot be undone.`
          : "This cannot be undone.",
      confirmLabel: "Submit",
      tone: unanswered.length > 0 ? "danger" : "default",
    });
    if (!ok) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await runner.submitManually();
    } catch (error) {
      setSubmitError(errorMessage(error, "Could not submit"));
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-exam-canvas min-h-dvh">
      <header className="bg-exam-surface border-border sticky top-0 z-10 border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <span className="text-fg truncate text-sm font-medium">{runner.attempt.quizTitle}</span>
          <CountdownBadge deadlineAt={runner.attempt.deadlineAt} skewMs={runner.skewMs} />
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        {runner.connection === "reconnecting" ? (
          <Alert tone="warning" title="Reconnecting…">
            <p>Your connection dropped. Your answers save as soon as it&apos;s back.</p>
          </Alert>
        ) : null}
        {runner.violationMessage ? <Alert tone="warning">{runner.violationMessage}</Alert> : null}
        {!runner.fullscreenActive ? (
          <Alert tone="info">Fullscreen was exited. Leaving the exam screen is recorded.</Alert>
        ) : null}
        {submitError ? <Alert tone="danger">{submitError}</Alert> : null}

        <QuestionNav
          questionIds={questionIds}
          answeredIndex={answeredIndex}
          saveStatus={runner.saveStatus}
          current={index}
          onSelect={goTo}
        />

        <Card>
          <CardBody className="space-y-6 p-6">
            <ExamQuestionCard
              question={current}
              index={index}
              selected={runner.answers[current.id] ?? []}
              onChange={(ids) => runner.setAnswer(current.id, ids)}
              status={runner.saveStatus[current.id]}
            />
          </CardBody>
        </Card>

        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" onClick={() => goTo(index - 1)} disabled={index === 0}>
            Previous
          </Button>
          {index < runner.questions.length - 1 ? (
            <Button onClick={() => goTo(index + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
