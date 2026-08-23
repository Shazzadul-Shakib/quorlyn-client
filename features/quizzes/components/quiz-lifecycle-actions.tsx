"use client";

import { useState, useTransition } from "react";
import {
  archiveQuizAction,
  closeQuizAction,
  deleteQuizAction,
  duplicateQuizAction,
  publishQuizAction,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { ConfirmOptions } from "@/components/ui/confirm-dialog";
import { errorMessage } from "@/lib/api/errors";
import type { Quiz } from "@/types/api";

export function QuizLifecycleActions({ quiz }: { quiz: Quiz }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  async function run(label: string, confirmOptions: ConfirmOptions | null, action: () => Promise<void>) {
    if (confirmOptions && !(await confirm(confirmOptions))) return;
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) throw cause;
        setError(errorMessage(cause, `Could not ${label.toLowerCase()} this quiz`));
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div className="flex flex-wrap justify-end gap-2">
        {quiz.status === "DRAFT" ? (
          <>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  "Delete",
                  {
                    title: "Delete this draft?",
                    description: "This cannot be undone.",
                    confirmLabel: "Delete",
                    tone: "danger",
                  },
                  () => deleteQuizAction(quiz.id),
                )
              }
            >
              Delete
            </Button>
            <Button
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  "Publish",
                  {
                    title: "Publish this quiz?",
                    description:
                      "Questions freeze — you won't be able to add, edit, reorder, or delete them afterward. Students can start attempts once it opens.",
                    confirmLabel: "Publish",
                  },
                  () => publishQuizAction(quiz.id),
                )
              }
            >
              Publish
            </Button>
          </>
        ) : null}

        {quiz.status === "PUBLISHED" ? (
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => run("Duplicate", null, () => duplicateQuizAction(quiz.id))}
            >
              Duplicate to edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(
                  "Close",
                  {
                    title: "Close this quiz?",
                    description: "Attempts in progress are finalized immediately.",
                    confirmLabel: "Close",
                    tone: "danger",
                  },
                  () => closeQuizAction(quiz.id),
                )
              }
            >
              Close
            </Button>
          </>
        ) : null}

        {quiz.status === "CLOSED" ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() =>
              run("Archive", { title: "Archive this quiz?", confirmLabel: "Archive" }, () =>
                archiveQuizAction(quiz.id),
              )
            }
          >
            Archive
          </Button>
        ) : null}
      </div>
    </div>
  );
}
