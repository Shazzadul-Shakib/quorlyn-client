import { VerticalBarChart } from "@/components/ui/bar-chart";
import type { ScoreBucket } from "@/types/api";

export function ScoreDistributionChart({ buckets }: { buckets: ScoreBucket[] }) {
  const sorted = buckets.slice().sort((a, b) => a.bucket - b.bucket);

  return (
    <VerticalBarChart
      ariaLabel="Score distribution"
      tone="chart-1"
      data={sorted.map((bucket) => ({
        key: String(bucket.bucket),
        label: `${bucket.bucket * 10}%`,
        value: bucket.count,
        displayValue: `${bucket.count} attempt${bucket.count === 1 ? "" : "s"}`,
      }))}
    />
  );
}
