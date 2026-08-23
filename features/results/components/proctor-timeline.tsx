import { formatDateTime } from "@/lib/utils";
import type { ProctorEvent, ProctorEventType } from "@/types/api";

const LABEL: Record<ProctorEventType, string> = {
  TAB_HIDDEN: "Left the exam tab",
  WINDOW_BLUR: "Window lost focus",
  FULLSCREEN_EXIT: "Exited fullscreen",
  COPY: "Copied text",
  PASTE: "Pasted text",
  RECONNECT: "Reconnected",
  DEVICE_CHANGED: "Resumed on a different device",
};

export function ProctorTimeline({ events }: { events: ProctorEvent[] }) {
  if (events.length === 0) {
    return <p className="text-fg-subtle text-sm">No focus or proctoring events recorded.</p>;
  }

  return (
    <ol className="space-y-2">
      {events.map((event, index) => (
        <li key={index} className="flex items-center gap-3 text-sm">
          <span className="text-fg-subtle w-40 shrink-0 text-xs tabular-nums">
            {formatDateTime(event.occurredAt)}
          </span>
          <span className="text-fg">{LABEL[event.type]}</span>
        </li>
      ))}
    </ol>
  );
}
