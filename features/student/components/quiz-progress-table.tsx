import Link from "next/link";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { StudentProgressEntry } from "@/types/api";

/** Mirrors the backend's own gate (`AttemptsService.reviewOwnAttempt`) —
 * the quiz is over, and there's actually a submitted attempt to review. */
function canReview(entry: StudentProgressEntry): boolean {
  if (!entry.lastSubmittedAttemptId) return false;
  if (entry.quizStatus === "CLOSED" || entry.quizStatus === "ARCHIVED") return true;
  return entry.closesAt !== null && new Date(entry.closesAt).getTime() <= Date.now();
}

/**
 * One organization's worth of quiz progress. Shared by the cross-org Home
 * dashboard (one of these per organization group) and a single
 * organization's own page, so the two never drift apart.
 */
export function QuizProgressTable({ entries }: { entries: StudentProgressEntry[] }) {
  return (
    <Table>
      <THead>
        <TH>Quiz</TH>
        <TH align="right">Attempts</TH>
        <TH align="right">Best score</TH>
        <TH>Last attempt</TH>
        <TH />
      </THead>
      <TBody>
        {entries.map((entry) => (
          <TR key={entry.quizId}>
            <TD>{entry.quizTitle}</TD>
            <TD align="right">{entry.attempts}</TD>
            <TD align="right">
              {entry.bestScore === null ? "—" : `${entry.bestScore}/${entry.maxScore}`}
            </TD>
            <TD>{entry.lastAttemptAt ? formatDate(entry.lastAttemptAt) : "—"}</TD>
            <TD align="right">
              {canReview(entry) ? (
                <Link
                  href={`/app/attempts/${entry.lastSubmittedAttemptId}/review`}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Review
                </Link>
              ) : null}
            </TD>
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
