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
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <Field label="Quiz title" htmlFor="new-quiz-title" required>
        <Input id="new-quiz-title" name="title" required placeholder="e.g. Physics — Chapter 3" />
      </Field>
      <Field label="Duration (min)" htmlFor="new-quiz-duration" required>
        <Input id="new-quiz-duration" name="durationMinutes" type="number" min={1} required defaultValue={30} />
      </Field>
      <SubmitButton pendingLabel="Creating…">Create quiz</SubmitButton>
    </form>
  );
}
