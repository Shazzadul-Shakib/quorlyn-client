"use client";

import { useActionState } from "react";
import { updateOrgNameAction, type FormState } from "../actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const INITIAL: FormState = {};

export function OrgSettingsForm({ name }: { name: string }) {
  const [state, formAction] = useActionState(updateOrgNameAction, INITIAL);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.notice ? <Alert tone="success">{state.notice}</Alert> : null}
      <Field label="Organization name" htmlFor="org-name" required>
        <Input id="org-name" name="name" defaultValue={name} required />
      </Field>
      <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
    </form>
  );
}
