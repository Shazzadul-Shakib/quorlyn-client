"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconMenu } from "@/components/ui/icons";
import { OrgSwitcher } from "./org-switcher";
import { UserMenu } from "./user-menu";
import type { MembershipSummary, OrgContext, UserSummary } from "@/types/api";

export function Topbar({
  user,
  org,
  memberships,
  onMenuClick,
}: {
  user: UserSummary;
  org: OrgContext | null;
  memberships: MembershipSummary[];
  onMenuClick: () => void;
}) {
  const currentOrgName =
    memberships.find((m) => m.organizationId === org?.id)?.organizationName ?? null;

  return (
    <header className="border-border bg-surface flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <IconMenu />
      </Button>

      <div className="min-w-0 flex-1">
        {org ? (
          <OrgSwitcher
            currentOrganizationId={org.id}
            currentOrganizationName={currentOrgName}
            memberships={memberships}
          />
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <UserMenu user={user} org={org} />
      </div>
    </header>
  );
}
