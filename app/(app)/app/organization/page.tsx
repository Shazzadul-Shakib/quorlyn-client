import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getOrganizationDashboard } from "@/features/dashboard/api";
import { OrgOverview } from "@/features/organization/components/org-overview";
import { PageHeader } from "@/components/ui/page";

export const metadata: Metadata = { title: "Overview" };

export default async function OrganizationOverviewPage() {
  const me = await getMe();
  requireOrgPermission(me.org, ["VIEW_RESULTS", "MANAGE_ORGANIZATION"]);
  const dashboard = await getOrganizationDashboard();

  return (
    <>
      <PageHeader title="Overview" description="A snapshot of your organization." />
      <OrgOverview dashboard={dashboard} />
    </>
  );
}
