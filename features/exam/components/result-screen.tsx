import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Attempt, SubmissionCause } from "@/types/api";

const CAUSE_COPY: Record<SubmissionCause, (attempt: Attempt) => string> = {
  MANUAL: (attempt) => `Submitted. Score ${attempt.score ?? 0}/${attempt.maxScore}.`,
  TIMER_EXPIRED: () => "Time is up — your answers were submitted automatically.",
  DISCONNECTED: () => "Your connection dropped, so the exam was submitted automatically.",
  PROCTOR_VIOLATION: () => "The exam ended because the exam screen was left too many times.",
  QUIZ_CLOSED: () => "Your teacher closed this quiz; your answers were submitted.",
  ADMIN_CLOSED: () => "This attempt was closed by staff.",
};

export function ResultScreen({
  attempt,
  attemptsLeftLabel,
}: {
  attempt: Attempt;
  attemptsLeftLabel?: string;
}) {
  const copy = attempt.submissionCause ? CAUSE_COPY[attempt.submissionCause](attempt) : "Your attempt has ended.";

  return (
    <div className="bg-exam-canvas flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <Card>
          <CardBody className="space-y-4 p-8">
            <p className="text-fg-subtle text-sm font-medium tracking-wide uppercase">
              {attempt.quizTitle}
            </p>
            <p className="text-fg text-4xl font-semibold tabular-nums">
              {attempt.score ?? 0}
              <span className="text-fg-subtle text-xl"> / {attempt.maxScore}</span>
            </p>
            <p className="text-fg-muted text-sm">{copy}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge tone="neutral">Attempt {attempt.attemptNumber}</Badge>
              {attemptsLeftLabel ? <Badge tone="neutral">{attemptsLeftLabel}</Badge> : null}
            </div>
            <ButtonLink href="/app" className="w-full">
              Back to home
            </ButtonLink>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
