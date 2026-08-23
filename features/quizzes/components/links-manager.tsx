"use client";

import { useState, useTransition } from "react";
import { createLinkAction, revokeLinkAction } from "../actions";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert } from "@/components/ui/alert";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/page";
import { IconLink } from "@/components/ui/icons";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/utils";
import { useConfirm } from "@/components/ui/confirm-provider";
import type { QuizLink } from "@/types/api";

export function LinksManager({ quizId, links: initialLinks }: { quizId: string; links: QuizLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<QuizLink | null>(null);
  const confirm = useConfirm();

  function create() {
    setError(null);
    startTransition(async () => {
      try {
        const link = await createLinkAction(quizId, label.trim() ? { label: label.trim() } : {});
        setLinks((prev) => [link, ...prev]);
        setJustCreated(link);
        setLabel("");
      } catch (cause) {
        setError(errorMessage(cause, "Could not create a link"));
      }
    });
  }

  async function revoke(linkId: string) {
    const ok = await confirm({
      title: "Revoke this link?",
      description: "It will stop working immediately.",
      confirmLabel: "Revoke",
      tone: "danger",
    });
    if (!ok) return;
    setError(null);
    startTransition(async () => {
      try {
        await revokeLinkAction(quizId, linkId);
        setLinks((prev) =>
          prev.map((l) => (l.id === linkId ? { ...l, revokedAt: new Date().toISOString() } : l)),
        );
      } catch (cause) {
        setError(errorMessage(cause, "Could not revoke this link"));
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert tone="danger">{error}</Alert> : null}

      {justCreated?.url ? (
        <Alert tone="success" title="Link created — copy it now">
          <div className="mt-1 flex items-center gap-2">
            <code className="bg-surface-2 flex-1 truncate rounded px-2 py-1 text-xs">
              {justCreated.url}
            </code>
            <CopyButton value={justCreated.url} />
          </div>
          <p className="mt-1 text-xs">This is the only time the link is shown.</p>
        </Alert>
      ) : null}

      <Card>
        <CardHeader title="Create a link" />
        <CardBody className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <Field label="Label" htmlFor="link-label" hint="Optional, to tell links apart.">
              <Input id="link-label" value={label} onChange={(event) => setLabel(event.target.value)} />
            </Field>
          </div>
          <Button onClick={create} disabled={pending}>
            {pending ? "Creating…" : "Create link"}
          </Button>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        {links.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<IconLink />} title="No links yet" />
          </div>
        ) : (
          <Table>
            <THead>
              <TH>Label</TH>
              <TH align="right">Uses</TH>
              <TH>Expires</TH>
              <TH>Status</TH>
              <TH />
            </THead>
            <TBody>
              {links.map((link) => (
                <TR key={link.id}>
                  <TD>{link.label ?? "—"}</TD>
                  <TD align="right">
                    {link.usedCount}
                    {link.maxUses !== null ? ` / ${link.maxUses}` : ""}
                  </TD>
                  <TD>{link.expiresAt ? formatDate(link.expiresAt) : "Never"}</TD>
                  <TD>
                    <Badge tone={link.revokedAt ? "danger" : "success"}>
                      {link.revokedAt ? "Revoked" : "Active"}
                    </Badge>
                  </TD>
                  <TD align="right">
                    {!link.revokedAt ? (
                      <Button variant="danger" size="sm" disabled={pending} onClick={() => revoke(link.id)}>
                        Revoke
                      </Button>
                    ) : null}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
