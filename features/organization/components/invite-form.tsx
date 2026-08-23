"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createInviteAction, type InviteFormState } from "../actions";
import { PERMISSION_LABEL } from "../permission-labels";
import { Field, Input, Select, Checkbox } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PERMISSIONS } from "@/types/api";
import type { OrgRole } from "@/types/api";

const INITIAL: InviteFormState = {};

export function InviteForm() {
  const [state, formAction] = useActionState(createInviteAction, INITIAL);
  const [role, setRole] = useState<OrgRole>("STUDENT");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.created) formRef.current?.reset();
  }, [state.created]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.created ? (
        <Alert tone="success" title="Invite sent">
          <p>{state.created.email} will receive a link that expires {new Date(state.created.expiresAt).toLocaleDateString()}.</p>
        </Alert>
      ) : null}

      <Field label="Email" htmlFor="invite-email" required>
        <Input id="invite-email" name="email" type="email" required autoComplete="off" />
      </Field>

      <Field label="Role" htmlFor="invite-role">
        <Select
          id="invite-role"
          name="role"
          value={role}
          onChange={(event) => setRole(event.target.value as OrgRole)}
        >
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </Select>
      </Field>

      {role === "TEACHER" ? (
        <>
          <Checkbox name="isOrgOwner" label="Organization owner" />
          <fieldset className="space-y-2">
            <legend className="text-fg text-sm font-medium">Permissions</legend>
            {PERMISSIONS.map((permission) => (
              <Checkbox
                key={permission}
                name="permissions"
                value={permission}
                label={PERMISSION_LABEL[permission]}
              />
            ))}
          </fieldset>
        </>
      ) : null}

      <SubmitButton pendingLabel="Sending…">Send invite</SubmitButton>
    </form>
  );
}
