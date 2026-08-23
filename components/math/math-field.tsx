"use client";

import "mathlive";
import { useEffect, useRef } from "react";
import type { MathfieldElement } from "mathlive";
import { cn } from "@/lib/utils";

let staticsConfigured = false;

/** Runs once, on the client, before any field needs to render its fonts. */
function configureStatics() {
  if (staticsConfigured) return;
  staticsConfigured = true;
  window.MathfieldElement.fontsDirectory = "/mathlive/fonts";
  window.MathfieldElement.soundsDirectory = null;
}

export function MathField({
  value,
  onChange,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (latex: string) => void;
  className?: string;
  ariaLabel: string;
}) {
  const ref = useRef<MathfieldElement>(null);

  useEffect(() => {
    configureStatics();
  }, []);

  // The mathfield owns its own editing state; only push `value` in when it
  // diverges from what's already there, so typing never gets reset mid-edit.
  useEffect(() => {
    const field = ref.current;
    if (field && field.value !== value) {
      field.value = value;
    }
  }, [value]);

  useEffect(() => {
    const field = ref.current;
    if (!field) return;
    function handleInput() {
      onChange(field!.value);
    }
    field.addEventListener("input", handleInput);
    return () => field.removeEventListener("input", handleInput);
  }, [onChange]);

  return <math-field ref={ref} className={cn(className)} aria-label={ariaLabel} />;
}
