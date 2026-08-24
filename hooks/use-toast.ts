"use client";

import { useCallback } from "react";
import { useToastStore } from "@/stores/toast-store";
import type { ToastTone } from "@/stores/toast-store";

export interface ToastHandle {
  info: (message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
}

/** Replaces "set local error state, render an Alert next to the trigger" for
 * one-off async action failures — see AGENTS.md on why those break layout. */
export function useToast(): ToastHandle {
  const push = useToastStore((state) => state.push);

  const notify = useCallback(
    (tone: ToastTone) => (message: string, title?: string) => {
      push({ tone, title, message });
    },
    [push],
  );

  return {
    info: notify("info"),
    success: notify("success"),
    warning: notify("warning"),
    error: notify("danger"),
  };
}
