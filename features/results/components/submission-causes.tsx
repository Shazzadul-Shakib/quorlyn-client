import { HorizontalBarChart, type ChartTone } from "@/components/ui/bar-chart";
import type { SubmissionCause, SubmissionCauseCount } from "@/types/api";

const LABEL: Record<SubmissionCause, string> = {
  MANUAL: "Manual",
  TIMER_EXPIRED: "Timer expired",
  DISCONNECTED: "Disconnected",
  PROCTOR_VIOLATION: "Proctor violation",
  QUIZ_CLOSED: "Quiz closed",
  ADMIN_CLOSED: "Admin closed",
};

const TONE: Record<SubmissionCause, ChartTone> = {
  MANUAL: "success",
  TIMER_EXPIRED: "neutral",
  DISCONNECTED: "warning",
  PROCTOR_VIOLATION: "danger",
  QUIZ_CLOSED: "neutral",
  ADMIN_CLOSED: "neutral",
};

export function SubmissionCauses({ items }: { items: SubmissionCauseCount[] }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return <p className="text-fg-subtle text-sm">No submissions yet.</p>;

  const sorted = items.slice().sort((a, b) => b.count - a.count);

  return (
    <HorizontalBarChart
      ariaLabel="Submission causes"
      data={sorted.map((item) => ({
        key: item.cause,
        label: LABEL[item.cause],
        value: item.count,
        displayValue: String(item.count),
        tone: TONE[item.cause],
      }))}
    />
  );
}
