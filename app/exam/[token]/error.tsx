"use client";

import { useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";

export default function ExamLinkError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <CardBody className="space-y-4 p-6">
        <Alert tone="danger" title="Couldn't open this exam link">
          <p>{errorMessage(error, "Something went wrong loading this page.")}</p>
        </Alert>
        <Button variant="secondary" className="w-full" onClick={reset}>
          Try again
        </Button>
      </CardBody>
    </Card>
  );
}
