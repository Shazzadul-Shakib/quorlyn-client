"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { createQuestionAction, deleteQuestionAction, reorderQuestionsAction } from "../actions";
import type { QuestionInput } from "../api";
import { QuestionForm } from "./question-form";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Spinner } from "@/components/ui/page";
import {
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconEdit,
  IconPlus,
  IconBook,
} from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { AnswerKeyQuestion, QuestionType } from "@/types/api";

const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Single choice",
  MULTI_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / False",
};

/** `promptContent`/`optionContent` are rendered server-side by the caller —
 * see the comment on `RenderedContent` for why this component (which needs
 * "use client" for editing/reordering) can't call it directly.
 *
 * `pending` marks a question this component fabricated locally for the
 * optimistic-add overlay — see `buildPendingItem` — and is never set on a
 * question that came from the server. */
export type QuestionListItem = AnswerKeyQuestion & {
  promptContent: ReactNode;
  optionContent: Record<string, ReactNode>;
  pending?: boolean;
};

type OptimisticAction =
  | { type: "reorder"; ids: string[] }
  | { type: "add"; item: QuestionListItem };

/** No server round trip yet, so no rendered math preview either — this shows
 * the raw prompt/option text for the brief window before the real,
 * server-rendered question (or nothing, if the save failed) replaces it. */
function buildPendingItem(input: QuestionInput, position: number): QuestionListItem {
  const tempId = `pending-${crypto.randomUUID()}`;
  return {
    id: tempId,
    type: input.type,
    prompt: input.prompt,
    contentFormat: input.contentFormat,
    points: input.points,
    position,
    pending: true,
    options: input.options.map((option, index) => ({
      id: `${tempId}-option-${index}`,
      text: option.text,
      isCorrect: option.isCorrect,
      position: index,
    })),
    promptContent: <span className="whitespace-pre-wrap">{input.prompt}</span>,
    optionContent: Object.fromEntries(
      input.options.map((option, index) => [
        `${tempId}-option-${index}`,
        <span key={index} className="whitespace-pre-wrap">
          {option.text}
        </span>,
      ]),
    ),
  };
}

export function QuestionList({
  quizId,
  questions,
  editable,
}: {
  quizId: string;
  questions: QuestionListItem[];
  editable: boolean;
}) {
  // A brand-new quiz has nothing else to do here, so open straight to the
  // form instead of making the teacher click "Add question" first.
  const [adding, setAdding] = useState(() => editable && questions.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  const sorted = questions.slice().sort((a, b) => a.position - b.position);
  // Covers both reordering and adding a question optimistically — each
  // dispatch reflects the change the instant a button is clicked rather than
  // waiting for the round trip through the Server Action and
  // `revalidatePath`. It automatically reverts to `sorted` (this run's real
  // base value) if the transition's action throws, since `sorted` itself
  // never actually changed — that's what makes a failed add just disappear.
  const [ordered, applyOptimistic] = useOptimistic<QuestionListItem[], OptimisticAction>(
    sorted,
    (state, action) => {
      if (action.type === "add") return [...state, action.item];
      const byId = new Map(state.map((q) => [q.id, q]));
      return action.ids
        .map((id) => byId.get(id))
        .filter((q): q is QuestionListItem => q !== undefined);
    },
  );

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    const ids = ordered.map((q) => q.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    startTransition(async () => {
      applyOptimistic({ type: "reorder", ids });
      try {
        await reorderQuestionsAction(quizId, ids);
      } catch (cause) {
        toast.error(errorMessage(cause, "Could not reorder questions"));
      }
    });
  }

  function addQuestion(input: QuestionInput) {
    const position = (ordered.at(-1)?.position ?? -1) + 1;
    const item = buildPendingItem(input, position);
    startTransition(async () => {
      applyOptimistic({ type: "add", item });
      try {
        await createQuestionAction(quizId, input);
      } catch (cause) {
        toast.error(errorMessage(cause, "Could not save this question — it was not added."));
      }
    });
  }

  async function remove(questionId: string) {
    const ok = await confirm({
      title: "Delete this question?",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      try {
        await deleteQuestionAction(quizId, questionId);
      } catch (cause) {
        toast.error(errorMessage(cause, "Could not delete this question"));
      }
    });
  }

  return (
    <div className="space-y-4">
      {editable ? (
        adding ? (
          <Card>
            <CardBody>
              <QuestionForm
                quizId={quizId}
                onAdd={addQuestion}
                onDone={() => setAdding(false)}
                onCancel={() => setAdding(false)}
              />
            </CardBody>
          </Card>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="border-border text-fg-muted hover:border-border-strong hover:text-fg hover:bg-surface-2 flex w-full items-center justify-center gap-1.5 rounded-card border border-dashed py-3 text-sm font-medium transition-colors"
          >
            <IconPlus width={16} height={16} />
            Add question
          </button>
        )
      ) : null}

      {ordered.length === 0 && !editable ? (
        <Card>
          <div className="p-5">
            <EmptyState icon={<IconBook />} title="No questions yet" />
          </div>
        </Card>
      ) : (
        ordered.map((question, index) => (
          <Card key={question.id} className={cn(question.pending && "opacity-70")}>
            {editingId === question.id ? (
              <CardBody>
                <QuestionForm
                  quizId={quizId}
                  question={question}
                  onDone={() => setEditingId(null)}
                  onCancel={() => setEditingId(null)}
                />
              </CardBody>
            ) : (
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">{index + 1}</Badge>
                    <Badge tone="primary">{TYPE_LABEL[question.type]}</Badge>
                    <span className="text-fg-subtle text-xs">
                      {question.points} pt{question.points === 1 ? "" : "s"}
                    </span>
                  </div>
                  {question.pending ? (
                    <span className="text-fg-subtle flex shrink-0 items-center gap-1.5 text-xs">
                      <Spinner className="h-3.5 w-3.5" />
                      Saving…
                    </span>
                  ) : editable ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move up"
                        disabled={index === 0 || pending}
                        onClick={() => move(index, -1)}
                      >
                        <IconArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Move down"
                        disabled={index === ordered.length - 1 || pending}
                        onClick={() => move(index, 1)}
                      >
                        <IconArrowDown />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit question"
                        onClick={() => setEditingId(question.id)}
                      >
                        <IconEdit />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete question"
                        onClick={() => remove(question.id)}
                        disabled={pending}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  ) : null}
                </div>

                {question.promptContent}

                <ul className="space-y-1.5">
                  {question.options
                    .slice()
                    .sort((a, b) => a.position - b.position)
                    .map((option) => (
                      <li key={option.id} className="flex items-center gap-2 text-sm">
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full",
                            option.isCorrect ? "bg-success" : "bg-border-strong",
                          )}
                        />
                        {question.optionContent[option.id]}
                      </li>
                    ))}
                </ul>
              </CardBody>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
