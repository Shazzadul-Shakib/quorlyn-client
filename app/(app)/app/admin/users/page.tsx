import type { Metadata } from "next";
import { getMe } from "@/features/auth/me";
import { requireSuperadmin } from "@/features/shell/guard";
import { listUsers, getPlatformStats } from "@/features/admin/api";
import { PageHeader, EmptyState, Stat } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Paginator } from "@/components/ui/paginator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { IconUsers, IconSearch } from "@/components/ui/icons";
import { HorizontalBarChart } from "@/components/ui/bar-chart";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Users" };

const PAGE_SIZE = 20;

export default async function AdminUsersPage(
  props: PageProps<"/app/admin/users">,
) {
  const me = await getMe();
  requireSuperadmin(me.user);

  const { page: pageParam, q: qParam } = await props.searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const q = typeof qParam === "string" ? qParam : "";

  const [{ items, total }, stats] = await Promise.all([
    listUsers(page, PAGE_SIZE, q || undefined),
    getPlatformStats(),
  ]);

  return (
    <>
      <PageHeader
        title="Users"
        description={`${stats.usersTotal} user${stats.usersTotal === 1 ? "" : "s"} across the platform.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total users" value={stats.usersTotal} tone="primary" />
        {stats.membershipsByRole.map((row) => (
          <Stat
            key={row.role}
            label={row.role === "TEACHER" ? "Teacher memberships" : "Student memberships"}
            value={row.count}
          />
        ))}
      </div>

      {stats.membershipsByRole.length > 0 ? (
        <Card>
          <CardHeader
            title="Memberships by role"
            description="Active memberships platform-wide — a user with two organizations counts twice."
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

      <Card className="overflow-hidden">
        <CardHeader
          title="All users"
          action={
            <form className="flex items-center gap-2" action={`/app/admin/users`}>
              <Input
                type="search"
                name="q"
                placeholder="Search by email…"
                defaultValue={q}
                className="w-56"
              />
              <Button type="submit" variant="secondary" size="sm">
                <IconSearch width={14} height={14} />
                Search
              </Button>
            </form>
          }
        />
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<IconUsers />}
              title={q ? "No users match that search" : "No users yet"}
              description={q ? `Nothing found for "${q}".` : undefined}
            />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TH>Email</TH>
                <TH>Platform role</TH>
                <TH>Organizations</TH>
                <TH>Joined</TH>
                <TH align="right">Account</TH>
              </THead>
              <TBody>
                {items.map((user) => (
                  <TR key={user.id}>
                    <TD className="font-medium">
                      <ButtonLink
                        href={`/app/admin/users/${user.id}`}
                        variant="ghost"
                        size="sm"
                        className="text-fg h-auto px-0 py-0 font-medium hover:underline"
                      >
                        {user.email}
                      </ButtonLink>
                    </TD>
                    <TD>
                      <Badge tone={user.platformRole === "SUPERADMIN" ? "accent" : "neutral"}>
                        {user.platformRole === "SUPERADMIN" ? "Superadmin" : "Member"}
                      </Badge>
                    </TD>
                    <TD>{user.membershipCount}</TD>
                    <TD>{formatDate(user.createdAt)}</TD>
                    <TD align="right">
                      <Badge tone={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Deactivated"}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Paginator
              page={page}
              total={total}
              limit={PAGE_SIZE}
              hrefFor={(p) => `/app/admin/users?page=${p}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            />
          </>
        )}
      </Card>
    </>
  );
}
