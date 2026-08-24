"use client";

import { useState, useTransition } from "react";
import { setMemberStatusAction } from "../actions";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { MembershipStatus } from "@/types/api";

export function MemberStatusToggle({
  memberId,
  memberEmail,
  status,
}: {
  memberId: string;
  memberEmail: string;
  status: MembershipStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();
  const isActive = status === "ACTIVE";

  async function toggle() {
    const ok = isActive
      ? await confirm({
          title: `Suspend ${memberEmail}?`,
          description: "They lose access to this organization immediately.",
          confirmLabel: "Suspend",
          tone: "danger",
        })
      : await confirm({
          title: `Restore ${memberEmail}?`,
          description: "They can act in this organization again right away.",
          confirmLabel: "Restore",
          tone: "default",
        });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await setMemberStatusAction(memberId, isActive ? "SUSPENDED" : "ACTIVE");
      } catch (cause) {
        setError(errorMessage(cause, "Could not update this member's status"));
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant={isActive ? "danger" : "secondary"}
        size="sm"
        onClick={toggle}
        disabled={pending}
      >
        {pending ? "Updating…" : isActive ? "Suspend" : "Restore"}
      </Button>
      {error ? <p className="text-danger-fg text-xs">{error}</p> : null}
    </div>
  );
}
