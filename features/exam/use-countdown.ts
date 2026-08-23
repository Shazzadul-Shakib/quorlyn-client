"use client";

import { useEffect, useState } from "react";

/**
 * Recomputes remaining time from the deadline/skew anchors on every tick,
 * rather than decrementing a counter — a throttled background tab would
 * otherwise let the displayed clock drift from the server's.
 */
export function useCountdown(deadlineAt: string, skewMs: number): number {
  const [remaining, setRemaining] = useState(() => Date.parse(deadlineAt) - (Date.now() + skewMs));

  useEffect(() => {
    function tick() {
      setRemaining(Date.parse(deadlineAt) - (Date.now() + skewMs));
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt, skewMs]);

  return remaining;
}
