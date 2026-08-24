import type { Metadata } from "next";
import Link from "next/link";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { listQuizzes } from "@/features/quizzes/api";
import { CreateQuizModal } from "@/features/quizzes/components/create-quiz-modal";
import { PageHeader, EmptyState } from "@/components/ui/page";
import { Card } from "@/components/ui/card";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Paginator } from "@/components/ui/paginator";
import { QuizStatusBadge } from "@/components/quiz-status-badge";
import { ButtonLink } from "@/components/ui/button";
import { IconBook } from "@/components/ui/icons";
import { formatDate } from "@/lib/utils";
import type { QuizStatus } from "@/types/api";

export const metadata: Metadata = { title: "Quizzes" };

const PAGE_SIZE = 20;
const STATUS_FILTERS: { label: string; value: QuizStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default async function QuizzesPage(props: PageProps<"/app/quizzes">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_QUIZZES");

  const { status: statusParam, mine: mineParam, page: pageParam } = await props.searchParams;
  const status = STATUS_FILTERS.some((f) => f.value === statusParam)
    ? (statusParam as QuizStatus)
    : undefined;
  const mine = mineParam === "true";
  const page = Math.max(1, Number(pageParam) || 1);
  const { items, total } = await listQuizzes({ status, mine, page, limit: PAGE_SIZE });

  const queryFor = (overrides: { status?: QuizStatus; mine?: boolean; page?: number }) => {
    const params = new URLSearchParams();
    const nextStatus = overrides.status ?? status;
    const nextMine = overrides.mine ?? mine;
    const nextPage = overrides.page ?? page;
    if (nextStatus) params.set("status", nextStatus);
    if (nextMine) params.set("mine", "true");
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `/app/quizzes?${query}` : "/app/quizzes";
  };

  return (
    <>
      <PageHeader
        title="Quizzes"
        description={`${total} quiz${total === 1 ? "" : "zes"}.`}
        actions={<CreateQuizModal />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <ButtonLink
              key={filter.label}
              href={queryFor({ status: filter.value, page: 1 })}
              variant={status === filter.value ? "primary" : "secondary"}
              size="sm"
            >
              {filter.label}
            </ButtonLink>
          ))}
        </div>
        <ButtonLink href={queryFor({ mine: !mine, page: 1 })} variant={mine ? "primary" : "secondary"} size="sm">
          Mine only
        </ButtonLink>
      </div>

      <Card className="overflow-hidden">
        {items.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconBook />} title="No quizzes" description="Create one above to get started." />
          </div>
        ) : (
          <>
            <Table>
              <THead>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH>Created by</TH>
                <TH align="right">Questions</TH>
                <TH align="right">Points</TH>
                <TH>Created</TH>
              </THead>
              <TBody>
                {items.map((quiz) => (
                  <TR key={quiz.id}>
                    <TD>
                      <Link href={`/app/quizzes/${quiz.id}`} className="hover:underline">
                        {quiz.title}
                      </Link>
                    </TD>
                    <TD>
                      <QuizStatusBadge status={quiz.status} />
                    </TD>
                    <TD className="text-fg-muted">{quiz.createdByEmail}</TD>
                    <TD align="right">{quiz.questionCount}</TD>
                    <TD align="right">{quiz.totalPoints}</TD>
                    <TD>{formatDate(quiz.createdAt)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <Paginator page={page} total={total} limit={PAGE_SIZE} hrefFor={(p) => queryFor({ page: p })} />
          </>
        )}
      </Card>
    </>
  );
}
