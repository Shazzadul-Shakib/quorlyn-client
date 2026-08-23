import Link from "next/link";
import { Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { QuizStatusBadge } from "@/components/quiz-status-badge";
import { IconBook } from "@/components/ui/icons";
import type { TeacherDashboard } from "@/types/api";

export function TeacherHome({ dashboard }: { dashboard: TeacherDashboard }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Quizzes" value={dashboard.quizCount} />
        <Stat label="Published" value={dashboard.publishedCount} tone="success" />
        <Stat label="Drafts" value={dashboard.draftCount} />
        <Stat label="Attempts" value={dashboard.totalAttempts} tone="primary" />
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Your quizzes" />
        {dashboard.quizzes.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconBook />}
              title="No quizzes yet"
              description="Create your first quiz to start authoring questions."
              action={
                <Link
                  href="/app/quizzes"
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Go to Quizzes →
                </Link>
              }
            />
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
              {dashboard.quizzes.map((quiz) => (
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
                    {quiz.averageScore === null ? "—" : `${quiz.averageScore.toFixed(1)}/${quiz.totalPoints}`}
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
