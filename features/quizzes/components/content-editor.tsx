"use client";

import { useRef, useState } from "react";
import { MathField } from "@/components/math/math-field-lazy";
import { RenderedContent } from "@/components/math/rendered-content";
import { Textarea, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@/components/ui/icons";

/**
 * A plain-text field where a teacher writes prose and inserts LaTeX
 * formulas wrapped in `$…$`, with a preview using the exact renderer
 * students see — per the contract, authoring and exam must never disagree.
 */
export function ContentEditor({
  id,
  label,
  value,
  onChange,
  rows = 3,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}) {
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [latex, setLatex] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertFormula() {
    if (!latex.trim()) return;
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}$${latex}$${value.slice(end)}`);
    setLatex("");
    setFormulaOpen(false);
    requestAnimationFrame(() => el?.focus());
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setFormulaOpen((v) => !v)}>
          <IconPlus />
          Formula
        </Button>
      </div>

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        required={required}
      />

      {formulaOpen ? (
        <div className="border-border bg-surface-2 space-y-2 rounded-lg border p-3">
          <MathField value={latex} onChange={setLatex} ariaLabel="Formula" />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setFormulaOpen(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={insertFormula} disabled={!latex.trim()}>
              Insert
            </Button>
          </div>
        </div>
      ) : null}

      {value ? (
        <div className="border-border rounded-lg border border-dashed p-3">
          <p className="text-fg-subtle mb-1.5 text-xs font-medium tracking-wide uppercase">
            Preview
          </p>
          <RenderedContent value={value} format={value.includes("$") ? "LATEX_MIXED" : "PLAIN"} />
        </div>
      ) : null}
    </div>
  );
}
