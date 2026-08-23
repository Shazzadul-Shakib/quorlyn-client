"use client";

import { useEffect, useRef, useState } from "react";
import { useCountdown } from "../use-countdown";
import { formatClock, cn } from "@/lib/utils";

export function CountdownBadge({ deadlineAt, skewMs }: { deadlineAt: string; skewMs: number }) {
  const remaining = useCountdown(deadlineAt, skewMs);
  const clamped = Math.max(0, remaining);
  const tone =
    clamped < 60_000 ? "text-timer-critical" : clamped < 5 * 60_000 ? "text-timer-warn" : "text-timer-calm";

  // Announced at most once a minute — reading a live region every second
  // would be unusable with a screen reader.
  const [announced, setAnnounced] = useState("");
  const lastMinuteRef = useRef<number | null>(null);
  useEffect(() => {
    const minutes = Math.ceil(clamped / 60_000);
    if (lastMinuteRef.current !== minutes) {
      lastMinuteRef.current = minutes;
      setAnnounced(minutes <= 0 ? "Time is up." : `${minutes} minute${minutes === 1 ? "" : "s"} remaining.`);
    }
  }, [clamped]);

  return (
    <div className="flex items-center gap-2">
      <span className={cn("font-mono text-xl font-semibold tabular-nums", tone)}>
        {formatClock(clamped)}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {announced}
      </span>
    </div>
  );
}
