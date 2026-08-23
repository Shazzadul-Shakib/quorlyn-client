"use client";

import { useActionState } from "react";
import { updateMemberAction, type FormState } from "../actions";
import { PERMISSION_LABEL } from "../permission-labels";
import { Field, Select, Checkbox } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { PERMISSIONS } from "@/types/api";
import type { Member } from "@/types/api";

const INITIAL: FormState = {};

export function MemberEditForm({ member }: { member: Member }) {
  const [state, formAction] = useActionState(updateMemberAction, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="role" value={member.role} />

      <Field label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={member.status}>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </Select>
      </Field>

      {member.role === "TEACHER" ? (
        <>
          <Checkbox
            name="isOrgOwner"
            label="Organization owner"
            description="Owners satisfy every permission and can manage other owners."
            defaultChecked={member.isOrgOwner}
          />
          <fieldset className="space-y-2">
            <legend className="text-fg text-sm font-medium">Permissions</legend>
            {PERMISSIONS.map((permission) => (
              <Checkbox
                key={permission}
                name="permissions"
                value={permission}
                label={PERMISSION_LABEL[permission]}
                defaultChecked={member.permissions.includes(permission)}
              />
            ))}
          </fieldset>
        </>
      ) : null}

      <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
    </form>
  );
}
