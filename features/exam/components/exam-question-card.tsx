"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ExamQuestion } from "@/types/api";
import type { SaveStatus } from "../use-exam-runner";

/** Rendered server-side by the caller and passed down — see the comment on
 * `RenderedContent` for why this "use client" component can't call it
 * directly without shipping MathLive's LaTeX engine to every student. */
export type ExamQuestionContent = {
  promptContent: ReactNode;
  optionContent: Record<string, ReactNode>;
};

export function ExamQuestionCard({
  question,
  content,
  index,
  selected,
  onChange,
  status,
}: {
  question: ExamQuestion;
  content: ExamQuestionContent;
  index: number;
  selected: string[];
  onChange: (selectedOptionIds: string[]) => void;
  status: SaveStatus | undefined;
}) {
  const multi = question.type === "MULTI_CHOICE";
  const selectedSet = new Set(selected);

  function toggle(optionId: string) {
    if (multi) {
      onChange(
        selectedSet.has(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId],
      );
    } else {
      onChange([optionId]);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-fg-subtle text-sm font-medium">
          Question {index + 1} · {question.points} pt{question.points === 1 ? "" : "s"}
        </span>
        <SaveIndicator status={status} />
      </div>

      <div className="text-lg">{content.promptContent}</div>

      {multi ? (
        <p className="text-fg-subtle text-xs">Select every correct answer — partial credit is not given.</p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="sr-only">Options for question {index + 1}</legend>
        {question.options.map((option) => {
          const checked = selectedSet.has(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                "border-border bg-surface flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                checked && "border-primary-border bg-primary-soft",
              )}
            >
              <input
                type={multi ? "checkbox" : "radio"}
                name={`question-${question.id}`}
                checked={checked}
                onChange={() => toggle(option.id)}
                className="accent-primary mt-1 h-4 w-4 shrink-0"
              />
              {content.optionContent[option.id]}
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus | undefined }) {
  if (!status || status === "idle") return null;
  const label = { pending: "Saving…", saved: "Saved", error: "Not saved — retrying" }[status];
  return (
    <span className={cn("text-xs", status === "error" ? "text-danger-fg" : "text-fg-subtle")}>
      {label}
    </span>
  );
}
