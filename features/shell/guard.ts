import { notFound, redirect } from "next/navigation";
import type { OrgContext, Permission, UserSummary } from "@/types/api";

/**
 * Page-level permission gates. Nav already hides links a user can't use;
 * these cover a direct URL hit. The server API call is still the real
 * authority — this only decides what the page renders.
 */
export function requireSuperadmin(user: UserSummary): void {
  if (user.platformRole !== "SUPERADMIN") notFound();
}

/** Org owners satisfy any permission, matching the backend rule. */
export function requireOrgPermission(
  org: OrgContext | null,
  permission: Permission | Permission[],
): OrgContext {
  if (!org) redirect("/select-organization");
  const required = Array.isArray(permission) ? permission : [permission];
  const allowed = org.isOrgOwner || required.some((p) => org.permissions.includes(p));
  if (!allowed) notFound();
  return org;
}
