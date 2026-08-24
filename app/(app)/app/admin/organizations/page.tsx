import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireSuperadmin } from "@/features/shell/guard";
import { listOrganizations, getPlatformStats } from "@/features/admin/api";
import { CreateOrganizationModal } from "@/features/admin/components/create-organization-modal";
import { OrganizationStatusToggle } from "@/features/admin/components/organization-status-toggle";
import { PageHeader, EmptyState, Stat } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Paginator } from "@/components/ui/paginator";
import { CopyButton } from "@/components/ui/copy-button";
import { IconBuilding } from "@/components/ui/icons";
import { HorizontalBarChart } from "@/components/ui/bar-chart";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Organizations" };

const PAGE_SIZE = 20;

export default async function AdminOrganizationsPage(
  props: PageProps<"/app/admin/organizations">,
) {
  const me = await getMe();
  requireSuperadmin(me.user);

  const { page: pageParam } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ items, total }, stats] = await Promise.all([
    listOrganizations(page, PAGE_SIZE),
    getPlatformStats(),
  ]);

  return (
    <>
      <PageHeader
        title="Organizations"
        description={`${total} organization${total === 1 ? "" : "s"} on the platform.`}
        actions={<CreateOrganizationModal />}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total" value={stats.organizationsTotal} tone="primary" />
        <Stat label="Active" value={stats.organizationsActive} tone="success" />
        <Stat
          label="Suspended"
          value={stats.organizationsSuspended}
          tone={stats.organizationsSuspended > 0 ? "danger" : "default"}
        />
        <Stat label="Total users" value={stats.usersTotal} />
      </div>

      {/* Aggregates only — never who's in an organization or their details.
          That's each organization's own owners/admins to see, on their own
          Members page. */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.organizationsTotal > 0 ? (
          <Card>
            <CardHeader title="Access status" description="Active vs. suspended organizations." />
            <CardBody>
              <HorizontalBarChart
                ariaLabel="Organizations by access status"
                data={[
                  {
                    key: "active",
                    label: "Active",
                    value: stats.organizationsActive,
                    displayValue: String(stats.organizationsActive),
                    tone: "success",
                  },
                  {
                    key: "suspended",
                    label: "Suspended",
                    value: stats.organizationsSuspended,
                    displayValue: String(stats.organizationsSuspended),
                    tone: "danger",
                  },
                ]}
              />
            </CardBody>
          </Card>
        ) : null}

        {stats.membershipsByRole.length > 0 ? (
          <Card>
            <CardHeader
              title="Memberships by role"
              description="Platform-wide — a user with two organizations counts twice."
            />
            <CardBody>
              <HorizontalBarChart
                ariaLabel="Active memberships by role"
                data={stats.membershipsByRole.map((row) => ({
                  key: row.role,
                  label: row.role === "TEACHER" ? "Teacher" : "Student",
                  value: row.count,
                  displayValue: String(row.count),
                  tone: row.role === "TEACHER" ? "chart-1" : "chart-2",
                }))}
              />
            </CardBody>
          </Card>
        ) : null}
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="All organizations" />
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconBuilding />}
              title="No organizations yet"
              description="Create the first one above."
            />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TH>Name</TH>
                <TH>Join code</TH>
                <TH align="right">Teachers</TH>
                <TH align="right">Students</TH>
                <TH>Created</TH>
                <TH align="right">Access</TH>
              </THead>
              <TBody>
                {items.map((organization) => (
                  <TR key={organization.id}>
                    <TD>{organization.name}</TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{organization.joinCode}</span>
                        <CopyButton value={organization.joinCode} label="Copy" variant="ghost" />
                      </div>
                    </TD>
                    <TD align="right">{organization.teacherCount}</TD>
                    <TD align="right">{organization.studentCount}</TD>
                    <TD>{formatDate(organization.createdAt)}</TD>
                    <TD align="right">
                      <OrganizationStatusToggle
                        organizationId={organization.id}
                        organizationName={organization.name}
                        isActive={organization.isActive}
                      />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Paginator
              page={page}
              total={total}
              limit={PAGE_SIZE}
              hrefFor={(p) => `/app/admin/organizations?page=${p}`}
            />
          </>
        )}
      </Card>
    </>
  );
}
