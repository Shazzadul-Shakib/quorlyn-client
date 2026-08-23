import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 space-y-1">
        {breadcrumb ? (
          <div className="text-fg-subtle flex items-center gap-1.5 text-sm">
            {breadcrumb}
          </div>
        ) : null}
        <h1 className="text-fg truncate text-xl font-semibold tracking-tight">
          {title}
        </h1>
        {description ? (
          <p className="text-fg-muted max-w-2xl text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="border-border flex flex-col items-center gap-2.5 rounded-card border border-dashed px-6 py-10 text-center">
      {icon ? (
        <span className="bg-surface-2 text-fg-subtle rounded-full p-2.5">{icon}</span>
      ) : null}
      <div className="space-y-1">
        <p className="text-fg font-medium">{title}</p>
        {description ? (
          <p className="text-fg-muted mx-auto max-w-sm text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const valueTone = {
    default: "text-fg",
    primary: "text-primary",
    success: "text-success-fg",
    warning: "text-warning-fg",
    danger: "text-danger-fg",
  }[tone];

  return (
    <div className="border-border bg-surface rounded-card border p-3.5 shadow-sm">
      <p className="text-fg-muted text-[0.6875rem] font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className={cn("mt-1 text-xl font-semibold tabular-nums", valueTone)}>
        {value}
      </p>
      {hint ? <p className="text-fg-subtle mt-0.5 text-xs">{hint}</p> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "border-border border-t-primary inline-block h-4 w-4 animate-spin rounded-full border-2",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-surface-3 animate-pulse rounded-md", className)} />;
}
