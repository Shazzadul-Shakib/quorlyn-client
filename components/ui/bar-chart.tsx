"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { IconTable } from "./icons";

export type ChartTone =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const TONE_BG: Record<ChartTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-fg-subtle",
};

function ViewToggle({ tableView, onToggle }: { tableView: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-fg-subtle hover:text-fg-muted ml-auto flex items-center gap-1 text-xs"
    >
      <IconTable width={14} height={14} />
      {tableView ? "View as chart" : "View as table"}
    </button>
  );
}

/** A single labeled value — one bar (vertical) or one row (horizontal). */
export interface BarDatum {
  key: string;
  label: string;
  value: number;
  displayValue: string;
  tone?: ChartTone;
}

/** Vertical bars over a category axis, with a hover/focus tooltip carrying the exact value. */
export function VerticalBarChart({
  data,
  ariaLabel,
  tone = "chart-1",
  maxValue,
}: {
  data: BarDatum[];
  ariaLabel: string;
  tone?: ChartTone;
  maxValue?: number;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tableView, setTableView] = useState(false);
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const tooltipId = useId();

  if (tableView) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <ViewToggle tableView={tableView} onToggle={() => setTableView(false)} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-left text-xs font-semibold uppercase">
                {ariaLabel}
              </th>
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-right text-xs font-semibold uppercase">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {data.map((d) => (
              <tr key={d.key}>
                <td className="text-fg px-2 py-1.5">{d.label}</td>
                <td className="text-fg px-2 py-1.5 text-right tabular-nums">{d.displayValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <ViewToggle tableView={tableView} onToggle={() => setTableView(true)} />
      </div>
      <div className="flex h-32 items-end gap-1.5" role="img" aria-label={ariaLabel}>
        {data.map((d) => (
          <div key={d.key} className="relative flex flex-1 flex-col items-center gap-1.5">
            {hovered === d.key ? (
              <div
                id={`${tooltipId}-${d.key}`}
                role="status"
                className="border-border bg-surface text-fg pointer-events-none absolute -top-8 z-10 rounded-md border px-2 py-1 text-xs whitespace-nowrap shadow-md"
              >
                {d.displayValue}
              </div>
            ) : null}
            <button
              type="button"
              className={cn(
                "w-full rounded-t transition-[filter]",
                TONE_BG[tone],
                hovered === d.key ? "brightness-110" : undefined,
              )}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(d.key)}
              onBlur={() => setHovered(null)}
              aria-describedby={hovered === d.key ? `${tooltipId}-${d.key}` : undefined}
              aria-label={`${d.label}: ${d.displayValue}`}
            />
            <span className="text-fg-subtle text-[10px] tabular-nums">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Horizontal bars, one row per category — direct value label at the tip, no tooltip needed. */
export function HorizontalBarChart({
  data,
  ariaLabel,
  maxValue,
}: {
  data: BarDatum[];
  ariaLabel: string;
  maxValue?: number;
}) {
  const [tableView, setTableView] = useState(false);
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));

  if (tableView) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">
          <ViewToggle tableView={tableView} onToggle={() => setTableView(false)} />
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-left text-xs font-semibold uppercase">
                {ariaLabel}
              </th>
              <th scope="col" className="text-fg-muted px-2 py-1.5 text-right text-xs font-semibold uppercase">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {data.map((d) => (
              <tr key={d.key}>
                <td className="text-fg px-2 py-1.5">{d.label}</td>
                <td className="text-fg px-2 py-1.5 text-right tabular-nums">{d.displayValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <ViewToggle tableView={tableView} onToggle={() => setTableView(true)} />
      </div>
      <ul aria-label={ariaLabel} className="space-y-2.5">
        {data.map((d) => (
          <li key={d.key}>
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-fg-muted min-w-0 flex-1 truncate text-sm">{d.label}</span>
              <span className="text-fg-subtle shrink-0 text-xs tabular-nums">{d.displayValue}</span>
            </div>
            <div
              className="bg-chart-track h-2 w-full overflow-hidden rounded-full"
              role="img"
              aria-label={`${d.label}: ${d.displayValue}`}
            >
              <div
                className={cn("h-full rounded-full transition-[width]", TONE_BG[d.tone ?? "chart-1"])}
                style={{ width: `${Math.max(0, Math.min(100, (d.value / max) * 100))}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
