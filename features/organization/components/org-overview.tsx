import Link from "next/link";
import { Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { QuizStatusBadge } from "@/components/quiz-status-badge";
import { IconBook } from "@/components/ui/icons";
import type { OrganizationDashboard } from "@/types/api";

export function OrgOverview({ dashboard }: { dashboard: OrganizationDashboard }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Teachers" value={dashboard.teacherCount} />
        <Stat label="Students" value={dashboard.studentCount} />
        <Stat
          label="Quizzes"
          value={dashboard.quizCount}
          hint={`${dashboard.publishedQuizCount} published`}
        />
        <Stat
          label="Attempts"
          value={dashboard.attemptsInPeriod}
          hint="in range — a snapshot, not final"
          tone="primary"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Recent quizzes" />
        {dashboard.recentQuizzes.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconBook />} title="No quizzes yet" />
          </div>
        ) : (
          <Table>
            <THead>
              <TH>Title</TH>
              <TH>Status</TH>
              <TH align="right">Attempts</TH>
              <TH align="right">Students</TH>
              <TH align="right">Avg. score</TH>
            </THead>
            <TBody>
              {dashboard.recentQuizzes.map((quiz) => (
                <TR key={quiz.quizId}>
                  <TD>
                    <Link href={`/app/quizzes/${quiz.quizId}/results`} className="hover:underline">
                      {quiz.title}
                    </Link>
                  </TD>
                  <TD>
                    <QuizStatusBadge status={quiz.status} />
                  </TD>
                  <TD align="right">{quiz.attempts}</TD>
                  <TD align="right">{quiz.students}</TD>
                  <TD align="right">
                    {quiz.averageScore === null
                      ? "—"
                      : `${quiz.averageScore.toFixed(1)}/${quiz.totalPoints}`}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
