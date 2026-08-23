import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { listInvites } from "@/features/organization/api";
import { InviteForm } from "@/features/organization/components/invite-form";
import { InviteBatchForm } from "@/features/organization/components/invite-batch-form";
import { RevokeInviteButton } from "@/features/organization/components/revoke-invite-button";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Paginator } from "@/components/ui/paginator";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { IconMail } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";
import type { InviteStatus } from "@/types/api";

export const metadata: Metadata = { title: "Invites" };

const PAGE_SIZE = 20;

const STATUS_TONE: Record<InviteStatus, BadgeTone> = {
  PENDING: "info",
  ACCEPTED: "success",
  EXPIRED: "neutral",
  REVOKED: "danger",
};

const STATUS_LABEL: Record<InviteStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

const STATUS_FILTERS: { label: string; value: InviteStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Revoked", value: "REVOKED" },
];

export default async function InvitesPage(props: PageProps<"/app/organization/invites">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_MEMBERS");

  const { status: statusParam, page: pageParam } = await props.searchParams;
  const status = STATUS_FILTERS.some((f) => f.value === statusParam)
    ? (statusParam as InviteStatus)
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const items = await listInvites({ status, page, limit: PAGE_SIZE });

  return (
    <>
      <PageHeader title="Invites" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Invite one person" />
          <CardBody>
            <InviteForm />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Invite in bulk" />
          <CardBody>
            <InviteBatchForm />
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <ButtonLink
            key={filter.label}
            href={filter.value ? `/app/organization/invites?status=${filter.value}` : "/app/organization/invites"}
            variant={status === filter.value ? "primary" : "secondary"}
            size="sm"
          >
            {filter.label}
          </ButtonLink>
        ))}
      </div>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconMail />} title="No invites" />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TH>Email</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH>Expires</TH>
                <TH />
              </THead>
              <TBody>
                {items.map((invite) => (
                  <TR key={invite.id}>
                    <TD>{invite.email}</TD>
                    <TD>
                      <div className="flex items-center gap-1.5">
                        {invite.role === "TEACHER" ? "Teacher" : "Student"}
                        {invite.isOrgOwner ? <Badge tone="primary">Owner</Badge> : null}
                      </div>
                    </TD>
                    <TD>
                      <Badge tone={STATUS_TONE[invite.status]}>{STATUS_LABEL[invite.status]}</Badge>
                    </TD>
                    <TD>{formatDate(invite.expiresAt)}</TD>
                    <TD align="right">
                      {invite.status === "PENDING" ? <RevokeInviteButton inviteId={invite.id} /> : null}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Paginator
              page={page}
              hasMore={items.length === PAGE_SIZE}
              hrefFor={(p) => `/app/organization/invites?page=${p}${status ? `&status=${status}` : ""}`}
            />
          </>
        )}
      </Card>
    </>
  );
}
