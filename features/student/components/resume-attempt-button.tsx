"use client";

import { useState, useTransition } from "react";
import { resumeAttemptAction } from "../actions";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";

export function ResumeAttemptButton({ quizId, label }: { quizId: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function resume() {
    setError(null);
    startTransition(async () => {
      try {
        await resumeAttemptAction(quizId);
      } catch (cause) {
        if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) throw cause;
        setError(errorMessage(cause, "Could not resume this exam"));
      }
    });
  }

  return (
    <div className="space-y-1">
      <Button onClick={resume} disabled={pending} size="sm">
        {pending ? "Resuming…" : label}
      </Button>
      {error ? <p className="text-danger-fg text-xs">{error}</p> : null}
    </div>
  );
}
