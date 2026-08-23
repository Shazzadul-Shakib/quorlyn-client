import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizLinkPreview } from "@/features/student/api";
import { isAuthenticated } from "@/lib/api/server";
import { StartExamForm } from "@/features/student/components/start-exam-form";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { IconBook, IconClock } from "@/components/ui/icons";
import { formatDate, formatDuration } from "@/lib/utils";
import { ApiError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Join a quiz" };

/**
 * The literal URL a teacher shares — the backend bakes this exact path
 * (`{FRONTEND_URL}/exam/{token}`) into every link it creates
 * (quiz-links.service.ts), so this route can't be renamed on our side.
 * The actual timed runner lives at /exam/attempt/[attemptId] instead.
 */
export default async function ExamLinkPage(props: PageProps<"/exam/[token]">) {
  const { token } = await props.params;

  let preview;
  try {
    preview = await getQuizLinkPreview(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 410)) notFound();
    throw error;
  }

  const signedIn = await isAuthenticated();

  return (
    <Card>
      <CardBody className="space-y-5 p-6">
        <div className="space-y-1">
          <p className="text-fg-subtle text-sm">{preview.organizationName}</p>
          <h1 className="text-fg text-xl font-semibold tracking-tight">{preview.quizTitle}</h1>
          {preview.quizDescription ? (
            <p className="text-fg-muted text-sm">{preview.quizDescription}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <IconClock className="text-fg-subtle" />
            <span>{formatDuration(preview.durationSeconds)}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBook className="text-fg-subtle" />
            <span>
              {preview.questionCount} questions · {preview.totalPoints} pts
            </span>
          </div>
          {preview.subject ? <span className="text-fg-muted">{preview.subject}</span> : null}
          <Badge tone="neutral" className="w-fit">
            Up to {preview.maxAttempts} attempt{preview.maxAttempts === 1 ? "" : "s"}
          </Badge>
        </div>

        {preview.opensAt || preview.closesAt ? (
          <p className="text-fg-subtle text-xs">
            {preview.opensAt ? `Opens ${formatDate(preview.opensAt)}. ` : ""}
            {preview.closesAt ? `Closes ${formatDate(preview.closesAt)}.` : ""}
          </p>
        ) : null}

        {!preview.acceptingAttempts ? (
          <Alert tone="warning">This quiz isn&apos;t accepting attempts right now.</Alert>
        ) : signedIn ? (
          <StartExamForm token={token} maxAttempts={preview.maxAttempts} />
        ) : (
          <div className="space-y-2">
            <Alert tone="info">Sign in or join with a code to start this exam.</Alert>
            <div className="flex gap-2">
              <ButtonLink href={`/login?next=/exam/${token}`} className="flex-1">
                Sign in
              </ButtonLink>
              <ButtonLink href="/join" variant="secondary" className="flex-1">
                Join with a code
              </ButtonLink>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
