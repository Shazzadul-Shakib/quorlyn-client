import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Brand href="/" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="text-fg-subtle mx-auto w-full max-w-6xl px-6 py-6 text-xs">
        Timed examinations for schools — Bangla, English, and mathematics.
      </footer>
    </div>
  );
}
