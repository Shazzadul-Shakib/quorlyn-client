import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { StudentProgressEntry } from "@/types/api";

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
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
