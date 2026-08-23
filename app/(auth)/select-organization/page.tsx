import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { OrganizationPicker } from "@/features/auth/components/organization-picker";
import { logoutAction } from "@/features/auth/actions";
import { IconLogout } from "@/components/ui/icons";
import { api } from "@/lib/api/server";
import type { MeResponse } from "@/types/api";

export const metadata: Metadata = { title: "Choose an organization" };

export default async function SelectOrganizationPage(
  props: PageProps<"/select-organization">,
) {
  const { next } = await props.searchParams;
  const target = typeof next === "string" && next.startsWith("/") ? next : "/app";
  const me = await api<MeResponse>("/auth/me");

  // `me.org` is the token's already-resolved claim — the real source of
  // truth for "is an organization already selected", including the case
  // where auto-select skipped a suspended organization (ADR-0021) even
  // though its membership row is otherwise ACTIVE. A pure platform admin
  // has nothing to pick here either — same rule as `app/(app)/layout.tsx`.
  if (me.org || me.user.platformRole === "SUPERADMIN") {
    redirect(`/app`);
  }

  const allBlocked =
    me.memberships.length > 0 &&
    me.memberships.every(
      (m) => m.status === "SUSPENDED" || !m.organizationIsActive,
    );

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div className="space-y-1">
          <h1 className="text-fg text-xl font-semibold tracking-tight">
            Choose an organization
          </h1>
          <p className="text-fg-muted text-sm">
            You belong to {me.memberships.length} organization
            {me.memberships.length === 1 ? "" : "s"}. Everything you do next is
            scoped to the one you pick.
          </p>
          <p className="text-fg-subtle text-xs">Signed in as {me.user.email}</p>
        </div>

        {me.memberships.length === 0 ? (
          <div className="space-y-4">
            <Alert tone="info" title="No organizations yet">
              <p>
                Your account exists but is not part of any organization. Join
                one with a code, or open the invite link a teacher sent you.
              </p>
            </Alert>
            <ButtonLink href="/join" className="w-full">
              Join with a code
            </ButtonLink>
          </div>
        ) : (
          <OrganizationPicker memberships={me.memberships} next={target} />
        )}

        {allBlocked ? (
          <Alert tone="warning" title="Every organization you belong to is blocked">
            <p>
              A teacher membership was suspended, or an organization&apos;s
              platform access was suspended by a superadmin. Sign out and sign
              in with a different account if you meant to reach one, such as a
              superadmin account.
            </p>
          </Alert>
        ) : null}

        <form action={logoutAction} className="border-border border-t pt-4">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="text-fg-muted w-full"
          >
            <IconLogout width={15} height={15} />
            Sign out and use a different account
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
