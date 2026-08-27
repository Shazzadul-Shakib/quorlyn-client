import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { getStudentDashboard } from "@/features/dashboard/api";
import { getStudentAttempts } from "@/features/student/api";
import { QuizProgressTable } from "@/features/student/components/quiz-progress-table";
import { ResumeAttemptButton } from "@/features/student/components/resume-attempt-button";
import { PageHeader, Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft, IconBook } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Organization" };

/**
 * A student's own view of one organization they belong to — reachable from
 * the dynamic "Organizations" nav section built in `features/shell/nav.tsx`.
 * `/dashboard/student` and `/attempts/mine` both already span every
 * organization a student is in, so this needs no org-switch: it just
 * narrows that same cross-org data down to one organization's slice.
 */
export default async function StudentOrganizationPage(
  props: PageProps<"/app/organizations/[id]">,
) {
  const { id } = await props.params;
  const [me, dashboard, attempts] = await Promise.all([
    getMe(),
    getStudentDashboard(),
    getStudentAttempts(1, 50),
  ]);
  const membership = me.memberships.find((m) => m.organizationId === id && m.role === "STUDENT");
  if (!membership) notFound();

  const entries = dashboard.progress.filter((entry) => entry.organizationId === id);
  const quizIds = new Set(entries.map((entry) => entry.quizId));
  const inProgress = attempts.filter(
    (attempt) => attempt.status === "IN_PROGRESS" && quizIds.has(attempt.quizId),
  );
  const totalAttempts = entries.reduce((sum, entry) => sum + entry.attempts, 0);

  return (
    <>
      <PageHeader
        title={membership.organizationName}
        description="Your progress in this organization."
        breadcrumb={
          <Link href="/app" className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> Home
          </Link>
        }
        actions={
          !membership.organizationIsActive ? (
            <Badge tone="danger">Organization suspended</Badge>
          ) : membership.status === "SUSPENDED" ? (
            <Badge tone="danger">Membership suspended</Badge>
          ) : undefined
        }
      />

      {inProgress.length > 0 ? (
        <Card>
          <CardHeader title="Continue an exam" />
          <CardBody className="space-y-3">
            {inProgress.map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between gap-3">
                <span className="text-fg text-sm font-medium">{attempt.quizTitle}</span>
                <ResumeAttemptButton quizId={attempt.quizId} label="Continue" />
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat label="Quizzes attempted" value={entries.length} />
        <Stat label="Attempts" value={totalAttempts} tone="primary" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Quizzes" />
        {entries.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconBook />}
              title="No attempts yet"
              description="Once you sit a quiz in this organization, your progress shows up here."
            />
          </div>
        ) : (
          <QuizProgressTable entries={entries} />
        )}
      </Card>
    </>
  );
}
