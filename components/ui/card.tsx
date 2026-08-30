import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
}) {
  return (
    <Tag
      className={cn(
        "border-border bg-surface rounded-card border",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border flex flex-wrap items-start justify-between gap-2.5 border-b px-4 py-3",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-fg text-sm font-semibold">{title}</h2>
        {description ? (
          <p className="text-fg-muted mt-0.5 text-xs">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 py-3.5", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-surface-2 rounded-b-card flex flex-wrap items-center justify-end gap-2 border-t px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
