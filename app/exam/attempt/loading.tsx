import { Card, CardBody } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/page";

/** Mirrors ExamRunner's own shell (sticky header + question card) so the
 * timed attempt doesn't load in behind a blank screen — the one page in the
 * app where a silent wait is the worst place for it. */
export default function ExamAttemptLoading() {
  return (
    <div className="bg-exam-canvas min-h-dvh">
      <header className="bg-exam-surface border-border sticky top-0 z-10 border-b px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
        <Card>
          <CardBody className="space-y-6 p-6">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2.5">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
