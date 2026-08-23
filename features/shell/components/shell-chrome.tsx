"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { NavSection } from "../nav";
import type { MembershipSummary, OrgContext, UserSummary } from "@/types/api";

export function ShellChrome({
  user,
  org,
  memberships,
  sections,
  children,
}: {
  user: UserSummary;
  org: OrgContext | null;
  memberships: MembershipSummary[];
  sections: NavSection[];
  children: ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar sections={sections} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          org={org}
          memberships={memberships}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
}
