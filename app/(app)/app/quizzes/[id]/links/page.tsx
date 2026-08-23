import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMe } from "@/features/auth/me";
import { requireOrgPermission } from "@/features/shell/guard";
import { getQuiz, listLinks } from "@/features/quizzes/api";
import { LinksManager } from "@/features/quizzes/components/links-manager";
import { PageHeader } from "@/components/ui/page";
import { IconArrowLeft } from "@/components/ui/icons";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Links" };

export default async function QuizLinksPage(props: PageProps<"/app/quizzes/[id]/links">) {
  const me = await getMe();
  requireOrgPermission(me.org, "MANAGE_QUIZZES");

  const { id } = await props.params;
  let quiz;
  let links;
  try {
    [quiz, links] = await Promise.all([getQuiz(id), listLinks(id)]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader
        title={`Links — ${quiz.title}`}
        breadcrumb={
          <Link href={`/app/quizzes/${quiz.id}`} className="hover:text-fg flex items-center gap-1">
            <IconArrowLeft /> {quiz.title}
          </Link>
        }
        description="Anyone with an active link can start this quiz once it's open, and sign in or register on the way in."
      />
      <LinksManager quizId={quiz.id} links={links} />
    </>
  );
}
