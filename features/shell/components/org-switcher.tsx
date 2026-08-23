"use client";

import { useRef, useState, useTransition } from "react";
import { selectOrganizationAction } from "@/features/auth/actions";
import { Spinner } from "@/components/ui/page";
import { IconBuilding, IconChevronDown } from "@/components/ui/icons";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { MembershipSummary } from "@/types/api";
import { useClickOutside } from "@/hooks/use-click-outside";

export function OrgSwitcher({
  currentOrganizationId,
  currentOrganizationName,
  memberships,
}: {
  currentOrganizationId: string | null;
  currentOrganizationName: string | null;
  memberships: MembershipSummary[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [switching, setSwitching] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const others = memberships.filter(
    (m) => m.organizationId !== currentOrganizationId && m.status === "ACTIVE",
  );

  if (memberships.length <= 1 && !currentOrganizationName) return null;

  function choose(organizationId: string) {
    setSwitching(organizationId);
    setError(null);
    startTransition(async () => {
      try {
        await selectOrganizationAction(organizationId, "/app");
      } catch (cause) {
        if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) throw cause;
        setError(errorMessage(cause, "Could not switch organization"));
        setSwitching(null);
      }
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="border-border bg-surface hover:bg-surface-2 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors"
      >
        <IconBuilding className="text-fg-subtle" />
        <span className="max-w-40 truncate">{currentOrganizationName ?? "Select organization"}</span>
        {others.length > 0 ? (
          <IconChevronDown className={cn("text-fg-subtle transition-transform", open && "rotate-180")} />
        ) : null}
      </button>

      {open && others.length > 0 ? (
        <div
          role="listbox"
          className="border-border bg-surface absolute left-0 z-30 mt-2 w-64 space-y-1 rounded-lg border p-1.5 shadow-lg"
        >
          {error ? <p className="text-danger-fg px-2 py-1 text-xs">{error}</p> : null}
          {others.map((membership) => (
            <button
              key={membership.organizationId}
              type="button"
              role="option"
              aria-selected={false}
              disabled={pending}
              onClick={() => choose(membership.organizationId)}
              className="hover:bg-surface-2 flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors disabled:opacity-60"
            >
              <span className="truncate">{membership.organizationName}</span>
              {switching === membership.organizationId ? <Spinner /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
