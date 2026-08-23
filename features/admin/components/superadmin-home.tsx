import { Stat, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { ButtonLink } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { IconBuilding } from "@/components/ui/icons";
import { CreateOrganizationModal } from "./create-organization-modal";
import { formatDate } from "@/lib/utils";
import type { Organization, PlatformStats } from "@/types/api";

export function SuperadminHome({
  stats,
  recent,
}: {
  stats: PlatformStats;
  recent: Organization[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Organizations" value={stats.organizationsTotal} tone="primary" />
        <Stat label="Active" value={stats.organizationsActive} tone="success" />
        <Stat
          label="Suspended"
          value={stats.organizationsSuspended}
          tone={stats.organizationsSuspended > 0 ? "danger" : "default"}
        />
        <Stat label="Users" value={stats.usersTotal} />
      </div>

      <Card>
        <CardBody className="flex flex-col justify-center gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-fg text-sm font-medium">Onboard a new organization</p>
            <p className="text-fg-muted text-sm">
              You create it and name the first owner — they take it from there.
            </p>
          </div>
          <CreateOrganizationModal />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Recently created"
          description="The newest organizations on the platform."
        />
        {recent.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconBuilding />}
              title="No organizations yet"
              description="Create the first one above to get started."
            />
          </div>
        ) : (
          <Table>
            <THead>
              <TH>Name</TH>
              <TH>Join code</TH>
              <TH align="right">Created</TH>
            </THead>
            <TBody>
              {recent.map((organization) => (
                <TR key={organization.id}>
                  <TD className="font-medium">{organization.name}</TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{organization.joinCode}</span>
                      <CopyButton value={organization.joinCode} label="Copy" variant="ghost" />
                    </div>
                  </TD>
                  <TD align="right">{formatDate(organization.createdAt)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <div className="text-center">
        <ButtonLink href="/app/admin/organizations" variant="ghost" size="sm">
          View all organizations
        </ButtonLink>
      </div>
    </div>
  );
}
