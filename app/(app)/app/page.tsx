import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import {
  getOrganizationDashboard,
  getStudentDashboard,
  getTeacherDashboard,
} from "@/features/dashboard/api";
import { getStudentAttempts } from "@/features/student/api";
import { listOrganizations, getPlatformStats } from "@/features/admin/api";
import { StudentHome } from "@/features/dashboard/components/student-home";
import { TeacherHome } from "@/features/dashboard/components/teacher-home";
import { OrgOverview } from "@/features/organization/components/org-overview";
import { SuperadminHome } from "@/features/admin/components/superadmin-home";
import { PageHeader } from "@/components/ui/page";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Home" };

export default async function AppHomePage() {
  const me = await getMe();
  const { user, org } = me;

  if (org?.role === "STUDENT") {
    const [dashboard, attempts] = await Promise.all([
      getStudentDashboard(),
      getStudentAttempts(1, 20),
    ]);
    const inProgress = attempts.filter((attempt) => attempt.status === "IN_PROGRESS");
    return (
      <>
        <PageHeader title="Home" description="Your progress across every organization you belong to." />
        <StudentHome dashboard={dashboard} inProgress={inProgress} />
      </>
    );
  }

  if (org?.role === "TEACHER") {
    if (org.isOrgOwner) {
      const dashboard = await getOrganizationDashboard();
      return (
        <>
          <PageHeader title="Home" description="A snapshot of your organization." />
          <OrgOverview dashboard={dashboard} />
        </>
      );
    }

    const canSeeDashboard = org.permissions.includes("VIEW_RESULTS");
    if (canSeeDashboard) {
      const dashboard = await getTeacherDashboard();
      return (
        <>
          <PageHeader title="Home" description="An overview of the quizzes you own." />
          <TeacherHome dashboard={dashboard} />
        </>
      );
    }

    return (
      <>
        <PageHeader title="Home" />
        <Card>
          <CardBody className="space-y-3">
            <p className="text-fg-muted text-sm">
              You&apos;re signed in as a teacher without results access.
            </p>
            {org.permissions.includes("MANAGE_QUIZZES") ? (
              <ButtonLink href="/app/quizzes">Go to Quizzes</ButtonLink>
            ) : null}
          </CardBody>
        </Card>
      </>
    );
  }

  if (user.platformRole === "SUPERADMIN") {
    const [organizations, stats] = await Promise.all([
      listOrganizations(1, 5),
      getPlatformStats(),
    ]);
    return (
      <>
        <PageHeader
          title="Platform admin"
          description="Every organization on Quorlyn, managed from one place."
        />
        <SuperadminHome stats={stats} recent={organizations.items} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Home" />
      <Card>
        <CardBody>
          <p className="text-fg-muted text-sm">
            Your account isn&apos;t part of an organization yet.
          </p>
        </CardBody>
      </Card>
    </>
  );
}
