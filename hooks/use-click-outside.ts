"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/** Fires `onOutside` for a pointerdown outside `ref`, e.g. to close a dropdown. */
export function useClickOutside(ref: RefObject<HTMLElement | null>, onOutside: () => void): void {
  useEffect(() => {
    function handle(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("pointerdown", handle);
    return () => document.removeEventListener("pointerdown", handle);
  }, [ref, onOutside]);
}
