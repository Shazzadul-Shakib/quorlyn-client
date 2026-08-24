import Link from "next/link";
import { Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { ResumeAttemptButton } from "@/features/student/components/resume-attempt-button";
import { QuizProgressTable } from "@/features/student/components/quiz-progress-table";
import { IconBook } from "@/components/ui/icons";
import type { Attempt, StudentDashboard, StudentProgressEntry } from "@/types/api";

function groupByOrganization(
  entries: StudentProgressEntry[],
): { organizationId: string; organizationName: string; entries: StudentProgressEntry[] }[] {
  const order: string[] = [];
  const byId = new Map<string, StudentProgressEntry[]>();
  for (const entry of entries) {
    if (!byId.has(entry.organizationId)) {
      order.push(entry.organizationId);
      byId.set(entry.organizationId, []);
    }
    byId.get(entry.organizationId)!.push(entry);
  }
  return order.map((organizationId) => ({
    organizationId,
    organizationName: byId.get(organizationId)![0].organizationName,
    entries: byId.get(organizationId)!,
  }));
}

export function StudentHome({
  dashboard,
  inProgress,
}: {
  dashboard: StudentDashboard;
  inProgress: Attempt[];
}) {
  const groups = groupByOrganization(dashboard.progress);

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Organizations" value={dashboard.organizationCount} />
        <Stat label="Quizzes attempted" value={dashboard.quizzesAttempted} />
        <Stat label="Attempts submitted" value={dashboard.attemptsSubmitted} />
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<IconBook />}
          title="No attempts yet"
          description="Once you sit a quiz — with a join code, an invite, or a shared link — your progress shows up here."
        />
      ) : (
        groups.map((group) => (
          <Card key={group.organizationId} className="overflow-hidden">
            <CardHeader
              title={group.organizationName}
              action={
                <Link
                  href={`/app/organizations/${group.organizationId}`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  View organization →
                </Link>
              }
            />
            <QuizProgressTable entries={group.entries} />
          </Card>
        ))
      )}
    </div>
  );
}
