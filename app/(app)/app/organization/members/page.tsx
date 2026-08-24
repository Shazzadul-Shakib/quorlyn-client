import type { Metadata } from "next";
import Link from "next/link";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { listMembers } from "@/features/organization/api";
import { MemberStatusToggle } from "@/features/organization/components/member-status-toggle";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Paginator } from "@/components/ui/paginator";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { IconUsers } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";
import type { OrgRole } from "@/types/api";

export const metadata: Metadata = { title: "Members" };

const PAGE_SIZE = 20;
const ROLE_FILTERS: { label: string; value: OrgRole | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Teachers", value: "TEACHER" },
  { label: "Students", value: "STUDENT" },
];

export default async function MembersPage(props: PageProps<"/app/organization/members">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_MEMBERS");

  const { role: roleParam, page: pageParam } = await props.searchParams;
  const role = roleParam === "TEACHER" || roleParam === "STUDENT" ? roleParam : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total } = await listMembers({ role, page, limit: PAGE_SIZE });

  return (
    <>
      <PageHeader
        title="Members"
        description={`${total} member${total === 1 ? "" : "s"}.`}
        actions={<ButtonLink href="/app/organization/invites">Invite</ButtonLink>}
      />

      <div className="flex gap-2">
        {ROLE_FILTERS.map((filter) => (
          <ButtonLink
            key={filter.label}
            href={filter.value ? `/app/organization/members?role=${filter.value}` : "/app/organization/members"}
            variant={role === filter.value ? "primary" : "secondary"}
            size="sm"
          >
            {filter.label}
          </ButtonLink>
        ))}
      </div>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconUsers />} title="No members" description="Invite teachers or students to get started." />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Joined</TH>
                <TH />
              </THead>
              <TBody>
                {items.map((member) => (
                  <TR key={member.id}>
                    <TD>{member.email}</TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        {member.role === "TEACHER" ? "Teacher" : "Student"}
                        {member.isOrgOwner ? <Badge tone="primary">Owner</Badge> : null}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={member.status === "ACTIVE" ? "success" : "danger"}>
                        {member.status === "ACTIVE" ? "Active" : "Suspended"}
                      </Badge>
                    </TD>
                    <TD>{formatDate(member.joinedAt)}</TD>
                    <TD align="right">
                      <div className="flex items-center justify-end gap-3">
                        {member.role === "TEACHER" ? (
                          <Link
                            href={`/app/organization/members/${member.id}`}
                            className="text-primary text-sm hover:underline"
                          >
                            Edit
                          </Link>
                        ) : null}
                        <MemberStatusToggle
                          memberId={member.id}
                          memberEmail={member.email}
                          status={member.status}
                        />
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Paginator
              page={page}
              total={total}
              limit={PAGE_SIZE}
              hrefFor={(p) => `/app/organization/members?page=${p}${role ? `&role=${role}` : ""}`}
            />
          </>
        )}
      </Card>
    </>
  );
}
