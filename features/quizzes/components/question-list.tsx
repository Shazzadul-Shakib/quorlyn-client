"use client";

import { useOptimistic, useState, useTransition, type ReactNode } from "react";
import { deleteQuestionAction, reorderQuestionsAction } from "../actions";
import { QuestionForm } from "./question-form";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/page";
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
 * "use client" for editing/reordering) can't call it directly. */
export type QuestionListItem = AnswerKeyQuestion & {
  promptContent: ReactNode;
  optionContent: Record<string, ReactNode>;
};

export function QuestionList({
  quizId,
  questions,
  editable,
}: {
  quizId: string;
  questions: QuestionListItem[];
  editable: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  const sorted = questions.slice().sort((a, b) => a.position - b.position);
  // Reflects a reorder the instant a button is clicked, rather than waiting
  // for the round trip through the Server Action and `revalidatePath` — it
  // automatically reverts to `sorted`'s own order if the action throws,
  // since that base value never actually changed.
  const [optimisticOrder, setOptimisticOrder] = useOptimistic(sorted.map((q) => q.id));
  const byId = new Map(sorted.map((q) => [q.id, q]));
  const ordered = optimisticOrder
    .map((id) => byId.get(id))
    .filter((q): q is QuestionListItem => q !== undefined);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= optimisticOrder.length) return;
    const ids = optimisticOrder.slice();
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    startTransition(async () => {
      setOptimisticOrder(ids);
      try {
        await reorderQuestionsAction(quizId, ids);
      } catch (cause) {
        toast.error(errorMessage(cause, "Could not reorder questions"));
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
      {ordered.length === 0 && !adding ? (
        <Card>
          <div className="p-5">
            <EmptyState
              icon={<IconBook />}
              title="No questions yet"
              description={editable ? "Add your first question below." : undefined}
            />
          </div>
        </Card>
      ) : (
        ordered.map((question, index) => (
          <Card key={question.id}>
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
                  {editable ? (
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

      {editable ? (
        adding ? (
          <Card>
            <CardBody>
              <QuestionForm quizId={quizId} onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
            </CardBody>
          </Card>
        ) : (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            <IconPlus />
            Add question
          </Button>
        )
      ) : null}
    </div>
  );
}
