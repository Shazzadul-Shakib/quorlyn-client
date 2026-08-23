import { Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { ResumeAttemptButton } from "@/features/student/components/resume-attempt-button";
import { formatDate } from "@/lib/utils";
import { IconBook } from "@/components/ui/icons";
import type { Attempt, StudentDashboard, StudentProgressEntry } from "@/types/api";

function groupByOrganization(
  entries: StudentProgressEntry[],
): { organizationName: string; entries: StudentProgressEntry[] }[] {
  const order: string[] = [];
  const byName = new Map<string, StudentProgressEntry[]>();
  for (const entry of entries) {
    if (!byName.has(entry.organizationName)) {
      order.push(entry.organizationName);
      byName.set(entry.organizationName, []);
    }
    byName.get(entry.organizationName)!.push(entry);
  }
  return order.map((organizationName) => ({
    organizationName,
    entries: byName.get(organizationName)!,
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
          <Card key={group.organizationName} className="overflow-hidden">
            <CardHeader title={group.organizationName} />
            <Table>
              <THead>
                <TH>Quiz</TH>
                <TH align="right">Attempts</TH>
                <TH align="right">Best score</TH>
                <TH>Last attempt</TH>
              </THead>
              <TBody>
                {group.entries.map((entry) => (
                  <TR key={entry.quizId}>
                    <TD>{entry.quizTitle}</TD>
                    <TD align="right">{entry.attempts}</TD>
                    <TD align="right">
                      {entry.bestScore === null ? "—" : `${entry.bestScore}/${entry.maxScore}`}
                    </TD>
                    <TD>{entry.lastAttemptAt ? formatDate(entry.lastAttemptAt) : "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Card>
        ))
      )}
    </div>
  );
}
