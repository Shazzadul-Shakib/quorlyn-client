"use client";

import { useState, useTransition } from "react";
import { rotateJoinCodeAction } from "../actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { useConfirm } from "@/components/ui/confirm-provider";
import { useToast } from "@/hooks/use-toast";

export function JoinCodeCard({ joinCode: initial }: { joinCode: string }) {
  const [joinCode, setJoinCode] = useState(initial);
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const toast = useToast();

  async function rotate() {
    const ok = await confirm({
      title: "Rotate the join code?",
      description: "The old code stops working immediately.",
      confirmLabel: "Rotate",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await rotateJoinCodeAction();
      if ("error" in result) toast.error(result.error);
      else setJoinCode(result.joinCode);
    });
  }

  return (
    <Card>
      <CardHeader title="Join code" description="Students use this code to join without an invite." />
      <CardBody className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-fg font-mono text-lg tracking-widest">{joinCode}</span>
          <CopyButton value={joinCode} />
        </div>
        <Button variant="secondary" size="sm" onClick={rotate} disabled={pending}>
          {pending ? "Rotating…" : "Rotate join code"}
        </Button>
      </CardBody>
    </Card>
  );
}
