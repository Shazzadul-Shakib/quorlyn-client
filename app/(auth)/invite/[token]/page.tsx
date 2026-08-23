import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { AcceptInviteForm } from "@/features/auth/components/accept-invite-form";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/utils";
import type { InvitePreview } from "@/types/api";

export const metadata: Metadata = { title: "Accept invitation" };

export default async function InvitePage(props: PageProps<"/invite/[token]">) {
  const { token } = await props.params;

  let preview: InvitePreview;
  try {
    preview = await apiRequest<InvitePreview>(
      `/invites/token/${encodeURIComponent(token)}`,
    );
  } catch (error) {
    const gone = error instanceof ApiError && (error.status === 410 || error.status === 404);
    return (
      <Card>
        <CardBody className="space-y-4 p-6">
          <Alert tone="danger" title={gone ? "This invite is no longer valid" : "Could not open this invite"}>
            <p>
              {gone
                ? "It may have expired, been revoked, or already been used. Ask whoever invited you to send a new one."
                : "Please try the link again in a moment."}
            </p>
          </Alert>
          <ButtonLink href="/login" variant="secondary" className="w-full">
            Go to sign in
          </ButtonLink>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-fg text-xl font-semibold tracking-tight">
            Join {preview.organizationName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={preview.role === "TEACHER" ? "primary" : "accent"}>
              {preview.role === "TEACHER" ? "Teacher" : "Student"}
            </Badge>
            {preview.isOrgOwner ? <Badge tone="warning">Organization owner</Badge> : null}
          </div>
          <p className="text-fg-muted text-sm">
            Invitation for {preview.email}, valid until{" "}
            {formatDateTime(preview.expiresAt)}.
          </p>
        </div>

        <AcceptInviteForm token={token} preview={preview} />
      </CardBody>
    </Card>
  );
}
