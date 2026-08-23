import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getCurrentOrganization } from "@/features/organization/api";
import { OrgSettingsForm } from "@/features/organization/components/org-settings-form";
import { JoinCodeCard } from "@/features/organization/components/join-code-card";
import { PageHeader } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function OrganizationSettingsPage() {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_ORGANIZATION");

  const organization = await getCurrentOrganization();

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Organization name" />
          <CardBody>
            <OrgSettingsForm name={organization.name} />
          </CardBody>
        </Card>
        <JoinCodeCard joinCode={organization.joinCode} />
      </div>
    </>
  );
}
