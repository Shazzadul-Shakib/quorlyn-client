"use client";

import { useState, type ReactNode } from "react";
import { IconTable } from "@/components/ui/icons";
import { cn, percent } from "@/lib/utils";
import type { QuestionDifficulty } from "@/types/api";

const TONE_BG = { danger: "bg-danger", warning: "bg-warning", success: "bg-success" } as const;

function toneFor(correctRate: number): keyof typeof TONE_BG {
  return correctRate < 0.5 ? "danger" : correctRate < 0.75 ? "warning" : "success";
}

/** `promptContent` is rendered server-side by the caller — see the comment
 * on `RenderedContent` for why this can't call it directly here. */
export type QuestionDifficultyRow = QuestionDifficulty & { promptContent: ReactNode };

export function QuestionDifficultyList({ questions }: { questions: QuestionDifficultyRow[] }) {
  const [tableView, setTableView] = useState(false);
  const sorted = questions.slice().sort((a, b) => a.correctRate - b.correctRate);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setTableView((v) => !v)}
          className="text-fg-subtle hover:text-fg-muted ml-auto flex items-center gap-1 text-xs"
        >
          <IconTable width={14} height={14} />
          {tableView ? "View as chart" : "View as table"}
        </button>
      </div>

      {tableView ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-left text-xs font-semibold uppercase">
                Question
              </th>
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-right text-xs font-semibold uppercase">
                Correct
              </th>
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-right text-xs font-semibold uppercase">
                Answered
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {sorted.map((question) => (
              <tr key={question.questionId}>
                <td className="text-fg px-2 py-1.5">
                  <span className="text-fg-subtle mr-1.5 text-xs">Q{question.position}</span>
                  {question.promptContent}
                </td>
                <td className="text-fg px-2 py-1.5 text-right tabular-nums">{percent(question.correctRate)}</td>
                <td className="text-fg px-2 py-1.5 text-right tabular-nums">{question.answered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul aria-label="Question difficulty" className="space-y-4">
          {sorted.map((question) => {
            const tone = toneFor(question.correctRate);
            return (
              <li key={question.questionId} className="space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-fg-subtle text-xs">Q{question.position}</span>
                    <div className="text-fg-muted line-clamp-2 text-sm">{question.promptContent}</div>
                  </div>
                  <span className="text-fg-subtle shrink-0 text-xs tabular-nums">
                    {percent(question.correctRate)} · {question.answered} answered
                  </span>
                </div>
                <div
                  className="bg-chart-track h-2 w-full overflow-hidden rounded-full"
                  role="img"
                  aria-label={`${percent(question.correctRate)} correct`}
                >
                  <div
                    className={cn("h-full rounded-full transition-[width]", TONE_BG[tone])}
                    style={{ width: `${Math.max(0, Math.min(100, question.correctRate * 100))}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
