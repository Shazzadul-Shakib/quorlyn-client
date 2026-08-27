"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/errors";

export default function AuthError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full space-y-4">
      <Alert tone="danger" title="Something went wrong">
        <p>{errorMessage(error, "This page couldn't load.")}</p>
      </Alert>
      <Button variant="secondary" className="w-full" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
