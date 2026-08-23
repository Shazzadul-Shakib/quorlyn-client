"use client";

import { cn } from "@/lib/utils";
import type { SaveStatus } from "../use-exam-runner";

export function QuestionNav({
  questionIds,
  answeredIndex,
  saveStatus,
  current,
  onSelect,
}: {
  questionIds: string[];
  answeredIndex: Set<number>;
  saveStatus: Record<string, SaveStatus>;
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
      {questionIds.map((questionId, index) => {
        const status = saveStatus[questionId];
        const answered = answeredIndex.has(index);
        const isCurrent = current === index;
        return (
          <button
            key={questionId}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`Question ${index + 1}${answered ? ", answered" : ", unanswered"}`}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-medium transition-colors",
              isCurrent
                ? "border-primary bg-primary text-primary-fg"
                : answered
                  ? "border-success-soft bg-success-soft text-success-fg"
                  : "border-border bg-surface text-fg-muted",
              status === "error" && "border-danger",
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}
