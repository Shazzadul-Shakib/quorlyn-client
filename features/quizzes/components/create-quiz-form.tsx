"use client";

import { useActionState } from "react";
import { createQuizAction, type FormState } from "../actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const INITIAL: FormState = {};

export function CreateQuizForm() {
  const [state, formAction] = useActionState(createQuizAction, INITIAL);

  return (
    <div className="space-y-3">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <Field label="New quiz title" htmlFor="new-quiz-title">
            <Input id="new-quiz-title" name="title" required placeholder="e.g. Physics — Chapter 3" />
          </Field>
        </div>
        <div className="w-32">
          <Field label="Duration (min)" htmlFor="new-quiz-duration">
            <Input id="new-quiz-duration" name="durationMinutes" type="number" min={1} required defaultValue={30} />
          </Field>
        </div>
        <SubmitButton pendingLabel="Creating…">Create quiz</SubmitButton>
      </form>
    </div>
  );
}
