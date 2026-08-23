"use client";

import { useState, useTransition } from "react";
import { setOrganizationStatusAction } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/page";
import { errorMessage } from "@/lib/api/errors";
import { useConfirm } from "@/components/ui/confirm-provider";

export function OrganizationStatusToggle({
  organizationId,
  organizationName,
  isActive,
}: {
  organizationId: string;
  organizationName: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirm = useConfirm();

  async function toggle() {
    const ok = isActive
      ? await confirm({
          title: `Suspend ${organizationName}?`,
          description:
            "Every teacher and student in this organization loses access within a few minutes, as their sessions refresh. You can restore it any time.",
          confirmLabel: "Suspend",
          tone: "danger",
        })
      : await confirm({
          title: `Restore ${organizationName}?`,
          description: "Its teachers and students can act in it again right away.",
          confirmLabel: "Restore",
          tone: "default",
        });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await setOrganizationStatusAction(organizationId, !isActive);
      } catch (cause) {
        setError(errorMessage(cause, "Could not update this organization's access"));
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-3">
        <Badge tone={isActive ? "success" : "danger"} className="min-w-[4.5rem] justify-center">
          {isActive ? "Active" : "Suspended"}
        </Badge>
        <Button
          variant={isActive ? "danger" : "secondary"}
          size="sm"
          onClick={toggle}
          disabled={pending}
          className="min-w-[5.5rem]"
        >
          {pending ? (
            <>
              <Spinner className="h-3 w-3 border-current border-t-transparent" />
              Updating…
            </>
          ) : isActive ? (
            "Suspend"
          ) : (
            "Restore"
          )}
        </Button>
      </div>
      {error ? <p className="text-danger-fg text-xs">{error}</p> : null}
    </div>
  );
}
