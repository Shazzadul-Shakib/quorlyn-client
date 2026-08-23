"use client";

import { useActionState } from "react";
import { startAttemptFromLinkAction, type StartAttemptState } from "../actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const INITIAL: StartAttemptState = {};

export function StartExamForm({ token, maxAttempts }: { token: string; maxAttempts: number }) {
  const [state, formAction] = useActionState(startAttemptFromLinkAction, INITIAL);

  return (
    <form action={formAction} className="space-y-3">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="maxAttempts" value={maxAttempts} />
      <SubmitButton pendingLabel="Starting…" size="lg" className="w-full">
        Start exam
      </SubmitButton>
    </form>
  );
}
