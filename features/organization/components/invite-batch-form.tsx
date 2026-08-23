"use client";

import { useActionState, useState } from "react";
import { createInviteBatchAction, type BatchInviteFormState } from "../actions";
import { PERMISSION_LABEL } from "../permission-labels";
import { Field, Textarea, Select, Checkbox } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { PERMISSIONS } from "@/types/api";
import type { BatchInviteOutcome, OrgRole } from "@/types/api";

const OUTCOME_LABEL: Record<BatchInviteOutcome, string> = {
  INVITED: "Invited",
  ALREADY_MEMBER: "Already a member",
  ALREADY_INVITED: "Already invited",
};

const INITIAL: BatchInviteFormState = {};

export function InviteBatchForm() {
  const [state, formAction] = useActionState(createInviteBatchAction, INITIAL);
  const [role, setRole] = useState<OrgRole>("STUDENT");

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field label="Email addresses" htmlFor="emails" hint="One per line, or separated by commas." required>
        <Textarea id="emails" name="emails" rows={4} required />
      </Field>

      <Field label="Role" htmlFor="batch-role">
        <Select
          id="batch-role"
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

      <SubmitButton pendingLabel="Sending…">Send invites</SubmitButton>

      {state.result ? (
        <div className="space-y-2 pt-2">
          <p className="text-fg-muted text-sm">
            {state.result.created} invited, {state.result.skipped} skipped.
          </p>
          <Table>
            <THead>
              <TH>Email</TH>
              <TH>Result</TH>
            </THead>
            <TBody>
              {state.result.results.map((result) => (
                <TR key={result.email}>
                  <TD>{result.email}</TD>
                  <TD>
                    <Badge tone={result.status === "INVITED" ? "success" : "warning"}>
                      {OUTCOME_LABEL[result.status]}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      ) : null}
    </form>
  );
}
