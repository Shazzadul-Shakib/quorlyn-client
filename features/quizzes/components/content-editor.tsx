"use client";

import { useRef, useState } from "react";
import { MathField } from "@/components/math/math-field-lazy";
import { RenderedContent } from "@/components/math/rendered-content";
import { Textarea, Input, Label } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { IconFunction } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * A text field where the author writes prose and inserts LaTeX formulas
 * wrapped in `$…$`, previewed with the exact renderer students see — per
 * the contract, authoring and exam must never disagree.
 *
 * One component covers both shapes the quiz editor needs so the formula
 * workflow exists exactly once: pass `rows` for the multi-line question
 * prompt, or `compact` (no `rows`) for a single-line field like an answer
 * option, where the toggle collapses to an icon button beside the input.
 */
export function ContentEditor({
  id,
  label,
  ariaLabel,
  value,
  onChange,
  rows,
  required,
  disabled,
  placeholder,
  compact = false,
}: {
  id: string;
  label?: string;
  ariaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
}) {
  const [formulaOpen, setFormulaOpen] = useState(false);
  const [latex, setLatex] = useState("");
  const [asDisplay, setAsDisplay] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const setFieldRef = (el: HTMLTextAreaElement | HTMLInputElement | null) => {
    fieldRef.current = el;
  };
  const multiline = rows !== undefined;
  const hasMath = value.includes("$");
  const canInsertFormula = !disabled;
  const wrappedLatex = asDisplay ? `$$${latex}$$` : `$${latex}$`;

  function toggleFormula() {
    setFormulaOpen((v) => !v);
  }

  function insertFormula() {
    if (!latex.trim()) return;
    const el = fieldRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    onChange(`${value.slice(0, start)}${wrappedLatex}${value.slice(end)}`);
    setLatex("");
    setAsDisplay(false);
    setFormulaOpen(false);
    requestAnimationFrame(() => el?.focus());
  }

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {label ? (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
          {canInsertFormula ? (
            <Button
              type="button"
              variant={formulaOpen ? "soft" : "ghost"}
              size="sm"
              onClick={toggleFormula}
            >
              <IconFunction width={15} height={15} />
              Formula
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className={compact ? "flex items-center gap-1.5" : undefined}>
        {multiline ? (
          <Textarea
            ref={setFieldRef}
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            rows={rows}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={label ? undefined : ariaLabel}
          />
        ) : (
          <Input
            ref={setFieldRef}
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            aria-label={label ? undefined : ariaLabel}
            className={compact ? "flex-1" : undefined}
          />
        )}
        {compact && canInsertFormula ? (
          <Button
            type="button"
            variant={formulaOpen ? "soft" : "ghost"}
            size="icon"
            onClick={toggleFormula}
            aria-label="Insert formula"
            title="Insert formula"
            className="shrink-0"
          >
            <IconFunction width={15} height={15} />
          </Button>
        ) : null}
      </div>

      {formulaOpen ? (
        <div
          className={cn(
            "border-border bg-surface-2 space-y-2 rounded-lg border",
            compact ? "p-2.5" : "p-3",
          )}
        >
          <MathField value={latex} onChange={setLatex} ariaLabel="Formula" />

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex gap-1" role="group" aria-label="Formula layout">
              <Button
                type="button"
                size="sm"
                variant={asDisplay ? "ghost" : "soft"}
                aria-pressed={!asDisplay}
                onClick={() => setAsDisplay(false)}
              >
                Inline
              </Button>
              <Button
                type="button"
                size="sm"
                variant={asDisplay ? "soft" : "ghost"}
                aria-pressed={asDisplay}
                onClick={() => setAsDisplay(true)}
              >
                Display
              </Button>
            </div>
            <p className="text-fg-subtle text-xs">
              {asDisplay
                ? "Centered on its own line — best for a standalone equation."
                : "Sits within the sentence, sized to match the surrounding text."}
            </p>
          </div>

          {latex.trim() ? (
            <div className="border-border bg-surface rounded-md border border-dashed p-2">
              <RenderedContent value={wrappedLatex} format="LATEX_MIXED" />
            </div>
          ) : null}

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

      {hasMath ? (
        <div className={cn("border-border rounded-lg border border-dashed", compact ? "p-2" : "p-3")}>
          {compact ? null : (
            <p className="text-fg-subtle mb-1.5 text-xs font-medium tracking-wide uppercase">
              Preview
            </p>
          )}
          <RenderedContent value={value} format="LATEX_MIXED" />
        </div>
      ) : null}
    </div>
  );
}
