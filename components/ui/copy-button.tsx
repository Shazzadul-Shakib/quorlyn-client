"use client";

import { useState } from "react";
import { Button, type ButtonVariant } from "./button";
import { IconCheck, IconCopy } from "./icons";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  variant = "secondary",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonVariant;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant={variant} size="sm" onClick={copy}>
      {copied ? <IconCheck /> : <IconCopy />}
      {copied ? copiedLabel : label}
    </Button>
  );
}
