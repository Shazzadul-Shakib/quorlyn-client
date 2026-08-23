"use client";

import { useActionState } from "react";
import Link from "next/link";
import { joinOrganizationAction, type AuthFormState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const EMPTY: AuthFormState = {};

export function JoinForm({ defaultCode = "" }: { defaultCode?: string }) {
  const [state, formAction] = useActionState(joinOrganizationAction, EMPTY);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}
      {state.deviceConflict ? (
        <Alert tone="warning" title="Already signed in elsewhere">
          <p>
            This account holds a session on another device.{" "}
            <Link href="/login" className="font-medium underline">
              Sign in
            </Link>{" "}
            to move it here.
          </p>
        </Alert>
      ) : null}

      <Field
        label="Join code"
        htmlFor="joinCode"
        hint="The 8-character code from your school"
        required
      >
        <Input
          id="joinCode"
          name="joinCode"
          required
          minLength={6}
          maxLength={12}
          defaultValue={defaultCode}
          autoCapitalize="characters"
          className="font-mono text-lg tracking-[0.2em] uppercase"
          placeholder="K7M2PQ4R"
        />
      </Field>

      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        hint="New here? This sets your password. Already have an account? Use its password."
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Joining…">
        Join organization
      </SubmitButton>

      <p className="text-fg-muted text-center text-sm">
        Already enrolled?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
