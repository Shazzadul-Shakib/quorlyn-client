"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
import type { NavSection } from "../nav";

function isActive(pathname: string, href: string): boolean {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  sections,
  open,
  onClose,
}: {
  sections: NavSection[];
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  const nav = (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section, index) => (
        <div key={section.label ?? index} className="space-y-1">
          {section.label ? (
            <p className="text-fg-subtle px-2.5 text-xs font-semibold tracking-wide uppercase">
              {section.label}
            </p>
          ) : null}
          {section.items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="border-border bg-surface hidden w-56 shrink-0 flex-col border-r md:flex">
        <div className="border-border flex h-14 items-center border-b px-4">
          <Brand />
        </div>
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="bg-overlay absolute inset-0"
            onClick={onClose}
          />
          <aside className="bg-surface relative flex h-full w-56 flex-col shadow-lg">
            <div className="border-border flex h-14 items-center border-b px-4">
              <Brand />
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
