import type { ReactNode } from "react";
import {
  IconBook,
  IconBuilding,
  IconChart,
  IconHome,
  IconMail,
  IconSettings,
  IconUsers,
} from "@/components/ui/icons";
import type { OrgContext, UserSummary } from "@/types/api";

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

/** Org owners and the superadmin satisfy any permission — matches the backend rule. */
function canOrg(org: OrgContext): boolean {
  return org.isOrgOwner;
}

export function buildNavSections(user: UserSummary, org: OrgContext | null): NavSection[] {
  const sections: NavSection[] = [
    { items: [{ href: "/app", label: "Home", icon: <IconHome /> }] },
  ];

  if (org?.role === "TEACHER") {
    const teacherItems: NavItem[] = [];
    if (canOrg(org) || org.permissions.includes("MANAGE_QUIZZES")) {
      teacherItems.push({ href: "/app/quizzes", label: "Quizzes", icon: <IconBook /> });
    }
    if (teacherItems.length > 0) {
      sections.push({ label: "Teaching", items: teacherItems });
    }

    const orgItems: NavItem[] = [];
    if (
      canOrg(org) ||
      org.permissions.includes("VIEW_RESULTS") ||
      org.permissions.includes("MANAGE_ORGANIZATION")
    ) {
      orgItems.push({ href: "/app/organization", label: "Overview", icon: <IconChart /> });
    }
    if (canOrg(org) || org.permissions.includes("MANAGE_MEMBERS")) {
      orgItems.push({ href: "/app/organization/members", label: "Members", icon: <IconUsers /> });
      orgItems.push({ href: "/app/organization/invites", label: "Invites", icon: <IconMail /> });
    }
    if (canOrg(org) || org.permissions.includes("MANAGE_ORGANIZATION")) {
      orgItems.push({ href: "/app/organization/settings", label: "Settings", icon: <IconSettings /> });
    }
    if (orgItems.length > 0) {
      sections.push({ label: "Organization", items: orgItems });
    }
  }

  if (user.platformRole === "SUPERADMIN") {
    sections.push({
      label: "Platform",
      items: [
        { href: "/app/admin/organizations", label: "Organizations", icon: <IconBuilding /> },
        { href: "/app/admin/users", label: "Users", icon: <IconUsers /> },
      ],
    });
  }

  return sections;
}
