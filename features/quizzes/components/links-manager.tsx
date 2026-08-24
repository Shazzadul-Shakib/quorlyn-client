"use client";

import { useEffect, useState, useTransition } from "react";
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

/**
 * The backend only ever returns a link's raw URL once, at creation (it
 * doesn't keep the plaintext token around to hand back later). Caching it
 * here just remembers, in this browser, what the server already told us
 * once — it never asks the server for it again — so "copy it later" works
 * without minting a new link (and orphaning the old one) every time.
 */
const CACHE_KEY_PREFIX = "quorlyn.quiz-links.";

function readCachedUrls(quizId: string): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY_PREFIX + quizId);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeCachedUrls(quizId: string, urls: Record<string, string>) {
  try {
    window.localStorage.setItem(CACHE_KEY_PREFIX + quizId, JSON.stringify(urls));
  } catch {
    // Best-effort convenience cache; losing it just means falling back to
    // creating a new link, same as before this existed.
  }
}

export function LinksManager({ quizId, links: initialLinks }: { quizId: string; links: QuizLink[] }) {
  const [links, setLinks] = useState(initialLinks);
  const [label, setLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justCreated, setJustCreated] = useState<QuizLink | null>(null);
  const [cachedUrls, setCachedUrls] = useState<Record<string, string>>({});
  const confirm = useConfirm();

  // Deferred to after mount, like the theme override: the server has no
  // access to localStorage, so this can only be read client-side.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setCachedUrls(readCachedUrls(quizId));
  }, [quizId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function create() {
    setError(null);
    startTransition(async () => {
      try {
        const link = await createLinkAction(quizId, label.trim() ? { label: label.trim() } : {});
        setLinks((prev) => [link, ...prev]);
        setJustCreated(link);
        setLabel("");
        if (link.url) {
          const next = { ...cachedUrls, [link.id]: link.url };
          setCachedUrls(next);
          writeCachedUrls(quizId, next);
        }
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
        if (linkId in cachedUrls) {
          const next = { ...cachedUrls };
          delete next[linkId];
          setCachedUrls(next);
          writeCachedUrls(quizId, next);
        }
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
          <p className="mt-1 text-xs">
            The server only shows this once, but you can still copy it again later from this
            browser — from a different device or after clearing site data, create a new link
            instead.
          </p>
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
                      <div className="flex justify-end gap-2">
                        {cachedUrls[link.id] ? (
                          <CopyButton value={cachedUrls[link.id]} label="Copy" variant="secondary" />
                        ) : null}
                        <Button variant="danger" size="sm" disabled={pending} onClick={() => revoke(link.id)}>
                          Revoke
                        </Button>
                      </div>
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
