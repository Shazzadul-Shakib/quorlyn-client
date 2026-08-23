import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "bg-gradient-brand text-primary-fg grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
        className,
      )}
      aria-hidden="true"
    >
      Q
    </span>
  );
}

export function Brand({
  href = "/app",
  subtitle,
}: {
  href?: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <BrandMark />
      <span className="flex flex-col leading-tight">
        <span className="text-fg text-base font-semibold tracking-tight">Quorlyn</span>
        {subtitle ? (
          <span className="text-fg-subtle text-xs">{subtitle}</span>
        ) : null}
      </span>
    </Link>
  );
}
