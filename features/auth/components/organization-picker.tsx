"use client";

import { useTransition, useState } from "react";
import { selectOrganizationAction } from "../actions";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/page";
import { IconBuilding, IconChevronRight } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { errorMessage } from "@/lib/api/errors";
import type { MembershipSummary } from "@/types/api";

export function OrganizationPicker({
  memberships,
  next,
}: {
  memberships: MembershipSummary[];
  next: string;
}) {
  const [pending, startTransition] = useTransition();
  const [selecting, setSelecting] = useState<string | null>(null);
  const toast = useToast();

  function choose(organizationId: string) {
    setSelecting(organizationId);
    startTransition(async () => {
      try {
        await selectOrganizationAction(organizationId, next);
      } catch (cause) {
        // A redirect throws by design; only real failures land here.
        if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) throw cause;
        toast.error(errorMessage(cause, "Could not open that organization"));
        setSelecting(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {memberships.map((membership) => {
          const suspended = membership.status === "SUSPENDED";
          const orgSuspended = !membership.organizationIsActive;
          return (
            <li key={membership.organizationId}>
              <button
                type="button"
                disabled={suspended || orgSuspended || pending}
                onClick={() => choose(membership.organizationId)}
                className="border-border bg-surface hover:border-primary-border hover:bg-surface-2 flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="bg-primary-soft text-primary rounded-lg p-2">
                  <IconBuilding />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-fg block truncate font-medium">
                    {membership.organizationName}
                  </span>
                  <span className="text-fg-subtle flex items-center gap-1.5 text-xs">
                    {membership.isOrgOwner
                      ? "Owner"
                      : membership.role === "TEACHER"
                        ? "Teacher"
                        : "Student"}
                    {orgSuspended ? (
                      <Badge tone="danger">Organization suspended</Badge>
                    ) : suspended ? (
                      <Badge tone="danger">Suspended</Badge>
                    ) : null}
                  </span>
                </span>
                {selecting === membership.organizationId ? (
                  <Spinner />
                ) : (
                  <IconChevronRight className="text-fg-subtle" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
