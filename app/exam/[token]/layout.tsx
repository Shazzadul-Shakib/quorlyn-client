import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

/** The public link-landing page — branded chrome, not the full-screen runner (see app/exam/attempt/). */
export default function ExamLinkLayout({ children }: LayoutProps<"/exam/[token]">) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-5">
        <Brand href="/" />
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-start justify-center px-6 py-8">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
