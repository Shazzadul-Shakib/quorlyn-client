"use client";

import { useActionState, useEffect, useRef } from "react";
import { createOrganizationAction, type CreateOrganizationState } from "../actions";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";

const INITIAL: CreateOrganizationState = {};

export function CreateOrganizationForm() {
  const [state, formAction] = useActionState(createOrganizationAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.created) formRef.current?.reset();
  }, [state.created]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.created ? (
        <Alert tone="success" title="Organization created">
          <p>
            {state.created.name} is ready, with join code{" "}
            <span className="font-mono">{state.created.joinCode}</span>.
          </p>
        </Alert>
      ) : null}

      <Field label="Organization name" htmlFor="name" required>
        <Input id="name" name="name" required autoComplete="off" />
      </Field>
      <Field
        label="Owner email"
        htmlFor="ownerEmail"
        hint="They become the organization's first owner."
        required
      >
        <Input id="ownerEmail" name="ownerEmail" type="email" required autoComplete="off" />
      </Field>
      <SubmitButton pendingLabel="Creating…">Create organization</SubmitButton>
    </form>
  );
}
