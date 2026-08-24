"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  loginAction,
  requestDeviceChangeAction,
  verifyDeviceChangeAction,
  type AuthFormState,
} from "../actions";
import { Alert } from "@/components/ui/alert";
import { Field, Input } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

const EMPTY: AuthFormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(loginAction, EMPTY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (state.deviceConflict) {
    return (
      <DeviceChangePanel
        email={state.deviceConflict.email}
        password={password}
        activeDevice={state.deviceConflict.activeDevice}
        next={next}
      />
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.error ? <Alert tone="danger">{state.error}</Alert> : null}

      <Field label="Email" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@school.edu"
        />
      </Field>

      <Field label="Password" htmlFor="password" required>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>

      <p className="text-fg-muted text-center text-sm">
        Joining a class?{" "}
        <Link href="/join" className="text-primary font-medium hover:underline">
          Use a join code
        </Link>
      </p>
    </form>
  );
}

/**
 * The 409 is not a failure — the credentials were right. Moving the session
 * takes an emailed code, which also tells the account owner it happened.
 */
function DeviceChangePanel({
  email,
  password,
  activeDevice,
  next,
}: {
  email: string;
  password: string;
  activeDevice: { label: string | null; lastSeenAt: string } | null;
  next: string;
}) {
  const [requestState, requestCode] = useActionState(
    requestDeviceChangeAction,
    EMPTY,
  );
  const [verifyState, verify] = useActionState(verifyDeviceChangeAction, EMPTY);
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-4">
      <Alert tone="warning" title="Already signed in on another device">
        <p>
          {activeDevice?.label
            ? `${activeDevice.label} holds this account's session`
            : "Another device holds this account's session"}
          {activeDevice?.lastSeenAt
            ? `, last active ${formatDateTime(activeDevice.lastSeenAt)}`
            : ""}
          . Verify by email to sign out there and continue here.
        </p>
      </Alert>

      {requestState.error ? <Alert tone="danger">{requestState.error}</Alert> : null}
      {requestState.notice ? <Alert tone="info">{requestState.notice}</Alert> : null}
      {verifyState.error ? <Alert tone="danger">{verifyState.error}</Alert> : null}

      {!sent && !requestState.notice ? (
        <form action={requestCode} onSubmit={() => setSent(true)} className="space-y-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="password" value={password} />
          <SubmitButton className="w-full" pendingLabel="Sending code…">
            Email me a verification code
          </SubmitButton>
        </form>
      ) : null}

      <form action={verify} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="password" value={password} />
        <input type="hidden" name="next" value={next} />

        <Field
          label="Verification code"
          htmlFor="code"
          hint="Six digits, valid for 10 minutes"
          required
        >
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            required
            className="text-center font-mono text-lg tracking-[0.4em]"
            placeholder="000000"
          />
        </Field>

        <SubmitButton className="w-full" pendingLabel="Verifying…">
          Sign out other device and continue
        </SubmitButton>
      </form>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => window.location.reload()}
      >
        Use a different account
      </Button>
    </div>
  );
}
