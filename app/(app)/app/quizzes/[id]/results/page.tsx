import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getQuiz } from "@/features/quizzes/api";
import { getLeaderboard, getQuizDashboard, listAttempts } from "@/features/results/api";
import { ScoreDistributionChart } from "@/features/results/components/score-distribution-chart";
import { QuestionDifficultyList } from "@/features/results/components/question-difficulty-list";
import { SubmissionCauses } from "@/features/results/components/submission-causes";
import { PageHeader, Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconTrophy } from "@/components/ui/icons";
import { formatDateTime, percent } from "@/lib/utils";
import { ApiError } from "@/lib/api/errors";
import type { SubmissionCause } from "@/types/api";

export const metadata: Metadata = { title: "Results" };

const CAUSE_LABEL: Record<SubmissionCause, string> = {
  MANUAL: "Manual",
  TIMER_EXPIRED: "Timer expired",
  DISCONNECTED: "Disconnected",
  PROCTOR_VIOLATION: "Proctor violation",
  QUIZ_CLOSED: "Quiz closed",
  ADMIN_CLOSED: "Admin closed",
};

export default async function QuizResultsPage(props: PageProps<"/app/quizzes/[id]/results">) {
  const me = await getMe();
  requireOrgPermission(me.org, "VIEW_RESULTS");

  const { id } = await props.params;
  let quiz, dashboard, attempts, leaderboard;
  try {
    [quiz, dashboard, attempts, leaderboard] = await Promise.all([
      getQuiz(id),
      getQuizDashboard(id),
      listAttempts(id, 1, 20),
      getLeaderboard(id, 1, 20),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={`Results — ${quiz.title}`}
        breadcrumb={
          <Link href={`/app/quizzes/${quiz.id}`} className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> {quiz.title}
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Invited" value={dashboard.invitedStudents} />
        <Stat label="Attempts" value={dashboard.quiz.attempts} />
        <Stat label="Completion" value={percent(dashboard.completionRate)} />
        <Stat
          label="Average score"
          value={dashboard.quiz.averageScore === null ? "—" : dashboard.quiz.averageScore.toFixed(1)}
          hint={`out of ${dashboard.quiz.totalPoints}`}
          tone="primary"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Score distribution"
            description="A live snapshot — numbers move while the exam is running."
          />
          <CardBody>
            {dashboard.scoreDistribution.length === 0 ? (
              <p className="text-fg-subtle text-sm">No scored attempts yet.</p>
            ) : (
              <ScoreDistributionChart buckets={dashboard.scoreDistribution} />
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Submission causes" />
          <CardBody>
            <SubmissionCauses items={dashboard.submissionCauses} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Question difficulty" description="Sorted hardest first." />
        <CardBody>
          {dashboard.questionDifficulty.length === 0 ? (
            <p className="text-fg-subtle text-sm">No answered questions yet.</p>
          ) : (
            <QuestionDifficultyList questions={dashboard.questionDifficulty} />
          )}
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Attempts"
          description="Open Detail for the student behind an attempt — the roster endpoint doesn't carry it."
        />
        {attempts.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No attempts yet" />
          </div>
        ) : (
          <Table>
            <THead>
              <TH align="right">#</TH>
              <TH>Status</TH>
              <TH align="right">Score</TH>
              <TH>Cause</TH>
              <TH>Submitted</TH>
              <TH />
            </THead>
            <TBody>
              {attempts.map((attempt) => (
                <TR key={attempt.id}>
                  <TD align="right">{attempt.attemptNumber}</TD>
                  <TD>
                    <Badge tone={attempt.status === "SUBMITTED" ? "success" : "info"}>
                      {attempt.status === "SUBMITTED" ? "Submitted" : "In progress"}
                    </Badge>
                  </TD>
                  <TD align="right">
                    {attempt.score === null ? "—" : `${attempt.score}/${attempt.maxScore}`}
                  </TD>
                  <TD>{attempt.submissionCause ? CAUSE_LABEL[attempt.submissionCause] : "—"}</TD>
                  <TD>{attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "—"}</TD>
                  <TD align="right">
                    <Link
                      href={`/app/quizzes/${quiz.id}/results/${attempt.id}`}
                      className="text-primary text-sm hover:underline"
                    >
                      Detail
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Leaderboard" description={`Scoring policy: ${leaderboard.scoringPolicy}.`} />
        {leaderboard.entries.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconTrophy />} title="No entries yet" />
          </div>
        ) : (
          <Table>
            <THead>
              <TH align="right">Rank</TH>
              <TH>Student</TH>
              <TH align="right">Score</TH>
              <TH align="right">Duration</TH>
              <TH>Submitted</TH>
            </THead>
            <TBody>
              {leaderboard.entries.map((entry) => (
                <TR key={entry.attemptId}>
                  <TD align="right">{entry.rank}</TD>
                  <TD>{entry.email}</TD>
                  <TD align="right">
                    {entry.score}/{entry.maxScore}
                  </TD>
                  <TD align="right">{Math.round(entry.durationMs / 60000)}m</TD>
                  <TD>{formatDateTime(entry.submittedAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
