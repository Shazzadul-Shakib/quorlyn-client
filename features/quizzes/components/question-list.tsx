"use client";

import { useState, useTransition } from "react";
import { deleteQuestionAction, reorderQuestionsAction } from "../actions";
import { QuestionForm } from "./question-form";
import { RenderedContent } from "@/components/math/rendered-content";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/page";
import {
  IconArrowUp,
  IconArrowDown,
  IconTrash,
  IconEdit,
  IconPlus,
  IconBook,
} from "@/components/ui/icons";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { AnswerKeyQuestion, QuestionType } from "@/types/api";

const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE_CHOICE: "Single choice",
  MULTI_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / False",
};

export function QuestionList({
  quizId,
  questions,
  editable,
}: {
  quizId: string;
  questions: AnswerKeyQuestion[];
  editable: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  const sorted = questions.slice().sort((a, b) => a.position - b.position);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const ids = sorted.map((q) => q.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(target, 0, moved);
    setError(null);
    startTransition(async () => {
      try {
        await reorderQuestionsAction(quizId, ids);
      } catch (cause) {
        setError(errorMessage(cause, "Could not reorder questions"));
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
    setError(null);
    startTransition(async () => {
      try {
        await deleteQuestionAction(quizId, questionId);
      } catch (cause) {
        setError(errorMessage(cause, "Could not delete this question"));
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert tone="danger">{error}</Alert> : null}

      {sorted.length === 0 && !adding ? (
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
        sorted.map((question, index) => (
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
                        disabled={index === sorted.length - 1 || pending}
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

                <RenderedContent value={question.prompt} format={question.contentFormat} />

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
                        <RenderedContent value={option.text} format={question.contentFormat} />
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
