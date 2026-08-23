import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconAlert, IconCheck, IconInfo } from "./icons";

export type AlertTone = "info" | "success" | "warning" | "danger";

const TONES: Record<AlertTone, string> = {
  info: "border-info-soft bg-info-soft text-info-fg",
  success: "border-success-soft bg-success-soft text-success-fg",
  warning: "border-warning-soft bg-warning-soft text-warning-fg",
  danger: "border-danger-soft bg-danger-soft text-danger-fg",
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
  icon = true,
}: {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  icon?: boolean;
}) {
  const Glyph =
    tone === "success" ? IconCheck : tone === "info" ? IconInfo : IconAlert;
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-2.5 rounded-md border p-3 text-sm", TONES[tone], className)}
    >
      {icon ? <Glyph className="mt-0.5 shrink-0" /> : null}
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="[&_p]:leading-relaxed">{children}</div> : null}
      </div>
    </div>
  );
}
