import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireSuperadmin } from "@/features/shell/guard";
import { getUser } from "@/features/admin/api";
import { PageHeader, Stat } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft } from "@/components/ui/icons";
import { ApiError } from "@/lib/api/errors";
import { formatDate, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "User detail" };

export default async function AdminUserDetailPage(
  props: PageProps<"/app/admin/users/[id]">,
) {
  const me = await getMe();
  requireSuperadmin(me.user);

  const { id } = await props.params;
  let user;
  try {
    user = await getUser(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={user.email}
        breadcrumb={
          <Link href="/app/admin/users" className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> Users
          </Link>
        }
      />

      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <span className="bg-primary text-primary-fg grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold">
            {initials(user.email)}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-fg truncate font-medium">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={user.platformRole === "SUPERADMIN" ? "accent" : "neutral"}>
                {user.platformRole === "SUPERADMIN" ? "Superadmin" : "Member"}
              </Badge>
              <Badge tone={user.isActive ? "success" : "danger"}>
                {user.isActive ? "Active" : "Deactivated"}
              </Badge>
              {user.singleDeviceEnforced ? <Badge tone="info">Single device</Badge> : null}
            </div>
          </div>
          <Stat label="Joined" value={formatDate(user.createdAt)} />
          <Stat label="Organizations" value={user.membershipCount} tone="primary" />
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader
          title="Memberships"
          description="Every organization this user belongs to."
        />
        {user.memberships.length === 0 ? (
          <div className="p-5">
            <p className="text-fg-muted text-sm">Not a member of any organization.</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TH>Organization</TH>
              <TH>Role</TH>
              <TH>Membership status</TH>
              <TH align="right">Organization access</TH>
            </THead>
            <TBody>
              {user.memberships.map((membership) => (
                <TR key={membership.organizationId}>
                  <TD className="font-medium">{membership.organizationName}</TD>
                  <TD>
                    <Badge tone={membership.role === "TEACHER" ? "primary" : "info"}>
                      {membership.isOrgOwner
                        ? "Owner"
                        : membership.role === "TEACHER"
                          ? "Teacher"
                          : "Student"}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={membership.status === "ACTIVE" ? "success" : "danger"}>
                      {membership.status === "ACTIVE" ? "Active" : "Suspended"}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <Badge tone={membership.organizationIsActive ? "success" : "danger"}>
                      {membership.organizationIsActive ? "Active" : "Suspended"}
                    </Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
