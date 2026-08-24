"use client";

import { useEffect, useRef, useState } from "react";
import { useToastStore, type Toast as ToastData, type ToastTone } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import { IconAlert, IconCheck, IconInfo, IconX } from "./icons";

const TONES: Record<ToastTone, string> = {
  info: "border-info-soft bg-info-soft text-info-fg",
  success: "border-success-soft bg-success-soft text-success-fg",
  warning: "border-warning-soft bg-warning-soft text-warning-fg",
  danger: "border-danger-soft bg-danger-soft text-danger-fg",
};

const DURATIONS: Record<ToastTone, number> = {
  info: 5000,
  success: 4000,
  warning: 6000,
  danger: 7000,
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(DURATIONS[toast.tone]);
  const startedAtRef = useRef(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (paused) return;
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 200);
    }, remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    };
  }, [paused, toast.id, onDismiss]);

  const Glyph = toast.tone === "success" ? IconCheck : toast.tone === "info" ? IconInfo : IconAlert;

  return (
    <div
      role={toast.tone === "danger" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm gap-2.5 rounded-card border p-3 pr-2.5 text-sm shadow-lg transition-all duration-200",
        TONES[toast.tone],
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      <Glyph className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 space-y-0.5">
        {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
        <p className="leading-relaxed wrap-break-word">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        className="h-fit shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100"
      >
        <IconX width={14} height={14} />
      </button>
    </div>
  );
}

/** Mounted once at the root — see app/layout.tsx — so any client action
 * anywhere in the app can report a transient success/failure without
 * fighting for space in whatever layout happens to be nearby. */
export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col-reverse items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}
