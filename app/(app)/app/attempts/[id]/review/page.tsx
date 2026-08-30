import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAttemptReview } from "@/features/student/api";
import { GradedAnswers } from "@/features/results/components/graded-answers";
import { PageHeader, Stat } from "@/components/ui/page";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { IconArrowLeft } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api/errors";
import type { AttemptReview } from "@/types/api";

export const metadata: Metadata = { title: "Review" };

export default async function AttemptReviewPage(props: PageProps<"/app/attempts/[id]/review">) {
  const { id } = await props.params;

  let review: AttemptReview | null = null;
  let notClosedYet = false;
  try {
    review = await getAttemptReview(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    if (error instanceof ApiError && error.status === 403) {
      notClosedYet = true;
    } else {
      throw error;
    }
  }

  const breadcrumb = (
    <Link href="/app" className="hover:text-fg flex items-center gap-1">
      <IconArrowLeft /> Dashboard
    </Link>
  );

  if (notClosedYet || !review) {
    return (
      <>
        <PageHeader title="Review" breadcrumb={breadcrumb} />
        <Alert tone="info">
          The answer key for this quiz isn&apos;t available yet — it unlocks once the quiz
          closes.
        </Alert>
      </>
    );
  }

  const { attempt } = review;

  return (
    <>
      <PageHeader
        title={attempt.quizTitle}
        breadcrumb={breadcrumb}
        description={`Attempt ${attempt.attemptNumber}`}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          label="Score"
          value={attempt.score === null ? "—" : `${attempt.score}/${attempt.maxScore}`}
          tone="primary"
        />
        <Stat
          label="Submitted"
          value={attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "—"}
        />
      </div>

      <Card>
        <CardHeader
          title="Questions and corrections"
          description="Green marks the correct answer; red marks what you picked if it was wrong."
        />
        <CardBody>
          <GradedAnswers questions={review.questions} answers={review.answers} />
        </CardBody>
      </Card>
    </>
  );
}
