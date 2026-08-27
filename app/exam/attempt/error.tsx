"use client";

import { useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { ButtonLink, Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { errorMessage } from "@/lib/api/errors";

/** A failed attempt fetch here is high-stakes — a student mid-exam or about
 * to start one — so this offers a retry in place of Next's default error
 * page, plus a way back to their dashboard instead of a dead end. */
export default function ExamAttemptError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-exam-canvas flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardBody className="space-y-4 p-8">
            <Alert tone="danger" title="This exam couldn't load">
              <p>{errorMessage(error, "Something went wrong. Your progress so far is safe.")}</p>
            </Alert>
            <div className="flex flex-col gap-2">
              <Button onClick={reset}>Try again</Button>
              <ButtonLink href="/app" variant="secondary">
                Back to home
              </ButtonLink>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
