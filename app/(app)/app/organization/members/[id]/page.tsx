import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getMember } from "@/features/organization/api";
import { MemberEditForm } from "@/features/organization/components/member-edit-form";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { IconArrowLeft } from "@/components/ui/icons";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Edit member" };

export default async function MemberEditPage(props: PageProps<"/app/organization/members/[id]">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_MEMBERS");

  const { id } = await props.params;
  let member;
  try {
    member = await getMember(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Students have nothing here — no owner flag, no permissions — and status
  // now toggles inline from the members table.
  if (member.role !== "TEACHER") notFound();

  return (
    <>
      <PageHeader
        title={member.email}
        breadcrumb={
          <Link href="/app/organization/members" className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> Members
          </Link>
        }
      />
      <Card>
        <CardBody>
          <MemberEditForm member={member} />
        </CardBody>
      </Card>
    </>
  );
}
