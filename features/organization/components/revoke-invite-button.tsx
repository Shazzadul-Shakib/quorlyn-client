"use client";

import { useState, useTransition } from "react";
import { revokeInviteAction } from "../actions";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { useConfirm } from "@/components/ui/confirm-provider";

export function RevokeInviteButton({ inviteId }: { inviteId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  async function revoke() {
    const ok = await confirm({
      title: "Revoke this invite?",
      description: "The link will stop working.",
      confirmLabel: "Revoke",
      tone: "danger",
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await revokeInviteAction(inviteId);
      } catch (cause) {
        setError(errorMessage(cause, "Could not revoke this invite"));
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="danger" size="sm" onClick={revoke} disabled={pending}>
        {pending ? "Revoking…" : "Revoke"}
      </Button>
      {error ? <p className="text-danger-fg text-xs">{error}</p> : null}
    </div>
  );
}
