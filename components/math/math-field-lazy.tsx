"use client";

import dynamic from "next/dynamic";

/**
 * `next/dynamic` + `ssr: false` is only valid inside a Client Component —
 * this module is one, so every consumer can import this instead of the raw
 * field and stay agnostic of that constraint.
 */
export const MathField = dynamic(() => import("./math-field").then((m) => m.MathField), {
  ssr: false,
  loading: () => (
    <div className="border-border bg-surface h-11 w-full animate-pulse rounded-lg border" />
  ),
});
