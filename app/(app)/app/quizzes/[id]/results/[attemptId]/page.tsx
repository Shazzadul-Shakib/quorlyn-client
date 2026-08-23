import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getAnswerKey } from "@/features/quizzes/api";
import { getAttemptDetail } from "@/features/results/api";
import { GradedAnswers } from "@/features/results/components/graded-answers";
import { ProctorTimeline } from "@/features/results/components/proctor-timeline";
import { PageHeader, Stat } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { IconArrowLeft } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api/errors";
import type { SubmissionCause } from "@/types/api";

export const metadata: Metadata = { title: "Attempt detail" };

const CAUSE_LABEL: Record<SubmissionCause, string> = {
  MANUAL: "Submitted manually",
  TIMER_EXPIRED: "Time expired",
  DISCONNECTED: "Disconnected",
  PROCTOR_VIOLATION: "Proctor violation",
  QUIZ_CLOSED: "Quiz was closed",
  ADMIN_CLOSED: "Closed by staff",
};

export default async function AttemptDetailPage(
  props: PageProps<"/app/quizzes/[id]/results/[attemptId]">,
) {
  const me = await getMe();
  requireOrgPermission(me.org, "VIEW_RESULTS");

  const { id, attemptId } = await props.params;
  let detail, questions;
  try {
    [detail, questions] = await Promise.all([getAttemptDetail(attemptId), getAnswerKey(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { attempt } = detail;

  return (
    <>
      <PageHeader
        title={detail.studentEmail}
        breadcrumb={
          <Link href={`/app/quizzes/${id}/results`} className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> Results
          </Link>
        }
        description={`Attempt ${attempt.attemptNumber}`}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Score"
          value={attempt.score === null ? "—" : `${attempt.score}/${attempt.maxScore}`}
          tone="primary"
        />
        <Stat label="Status" value={attempt.status === "SUBMITTED" ? "Submitted" : "In progress"} />
        <Stat label="Cause" value={attempt.submissionCause ? CAUSE_LABEL[attempt.submissionCause] : "—"} />
        <Stat
          label="Focus violations"
          value={
            attempt.maxFocusViolations !== null
              ? `${attempt.focusViolations} / ${attempt.maxFocusViolations}`
              : attempt.focusViolations
          }
        />
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-fg-muted">Started</span> {formatDateTime(attempt.startedAt)}
        </p>
        <p>
          <span className="text-fg-muted">Submitted</span>{" "}
          {attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "—"}
        </p>
      </div>

      <Card>
        <CardHeader title="Answers" description={`${detail.answers.length} answered.`} />
        <CardBody>
          <GradedAnswers questions={questions} answers={detail.answers} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Proctoring timeline" />
        <CardBody>
          <ProctorTimeline events={detail.events} />
        </CardBody>
      </Card>
    </>
  );
}
