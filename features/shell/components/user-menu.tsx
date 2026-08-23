"use client";

import { useRef, useState } from "react";
import { logoutAction } from "@/features/auth/actions";
import { IconChevronDown, IconLogout } from "@/components/ui/icons";
import { initials, cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/use-click-outside";
import type { OrgContext, UserSummary } from "@/types/api";

const ROLE_LABEL: Record<OrgContext["role"], string> = {
  TEACHER: "Teacher",
  STUDENT: "Student",
};

export function UserMenu({ user, org }: { user: UserSummary; org: OrgContext | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const roleLine = org
    ? org.isOrgOwner
      ? "Owner"
      : ROLE_LABEL[org.role]
    : user.platformRole === "SUPERADMIN"
      ? "Superadmin"
      : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="hover:bg-surface-2 flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors"
      >
        <span className="bg-primary text-primary-fg grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold">
          {initials(user.email)}
        </span>
        <IconChevronDown className={cn("text-fg-subtle transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-surface absolute right-0 z-30 mt-2 w-60 rounded-lg border p-1.5 shadow-lg"
        >
          <div className="border-border mb-1 border-b px-2.5 py-2">
            <p className="text-fg truncate text-sm font-medium">{user.email}</p>
            {roleLine ? <p className="text-fg-subtle text-xs">{roleLine}</p> : null}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="text-danger-fg hover:bg-danger-soft flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors"
            >
              <IconLogout />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
