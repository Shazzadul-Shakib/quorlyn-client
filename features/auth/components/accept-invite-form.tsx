"use client";

import { useActionState } from "react";
import Link from "next/link";
import { acceptInviteAction, type AuthFormState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { InvitePreview } from "@/types/api";

const EMPTY: AuthFormState = {};

export function AcceptInviteForm({
  token,
  preview,
}: {
  token: string;
  preview: InvitePreview;
}) {
  const [state, formAction] = useActionState(acceptInviteAction, EMPTY);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={preview.email} />

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.deviceConflict ? (
        <Alert tone="warning" title="Already signed in elsewhere">
          <p>
            This account holds a session on another device.{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>{" "}
            to move it here, then open this link again.
          </p>
        </Alert>
      ) : null}

      <Field label="Email" htmlFor="invite-email">
        <Input id="invite-email" value={preview.email} readOnly disabled />
      </Field>

      <Field
        label={preview.accountExists ? "Your password" : "Choose a password"}
        htmlFor="password"
        hint={
          preview.accountExists
            ? "This email already has a Quorlyn account — signing in adds this organization to it."
            : "At least 8 characters."
        }
        required
      >
        <PasswordInput
          id="password"
          name="password"
          minLength={8}
          required
          autoComplete={preview.accountExists ? "current-password" : "new-password"}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Accepting…">
        {preview.accountExists ? "Join organization" : "Create account and join"}
      </SubmitButton>
    </form>
  );
}
