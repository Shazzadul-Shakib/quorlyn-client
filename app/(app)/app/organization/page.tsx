import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getOrganizationDashboard } from "@/features/dashboard/api";
import { OrgOverview } from "@/features/organization/components/org-overview";
import { PageHeader } from "@/components/ui/page";

export const metadata: Metadata = { title: "Overview" };

export default async function OrganizationOverviewPage() {
  // Both calls only need the session cookie, not each other's result, so
  // they run concurrently rather than paying for `getMe()`'s round trip
  // before the dashboard fetch starts.
  const [me, dashboard] = await Promise.all([getMe(), getOrganizationDashboard()]);
  requireOrgPermission(me.org, ["VIEW_RESULTS", "MANAGE_ORGANIZATION"]);

  return (
    <>
      <PageHeader title="Overview" description="A snapshot of your organization." />
      <OrgOverview dashboard={dashboard} />
    </>
  );
}
