import type { Metadata } from "next";
import { Brand } from "@/components/brand";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconBook,
  IconChart,
  IconClock,
  IconShield,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Quorlyn — timed online examinations",
};

const FEATURES = [
  {
    icon: IconBook,
    title: "Bangla, English, and mathematics",
    body: "Write a question in both scripts with formulae, chemical equations and units inline — it renders the same for every student.",
  },
  {
    icon: IconClock,
    title: "The clock belongs to the server",
    body: "Deadlines are set server-side, answers save as they are given, and a dropped connection submits rather than losing work.",
  },
  {
    icon: IconChart,
    title: "Results that mean something",
    body: "Leaderboards pick one attempt per student, and per-question difficulty shows what the class actually found hard.",
  },
  {
    icon: IconShield,
    title: "One account, one device",
    body: "Sessions are bound to a device, and moving one takes an emailed code — so sharing an account is visible, not convenient.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Brand href="/" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/login" variant="secondary" size="sm">
            Sign in
          </ButtonLink>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6">
        <section className="py-12 sm:py-16">
          <p className="text-primary text-xs font-semibold tracking-wide uppercase">
            For schools and classrooms
          </p>
          <h1 className="text-fg mt-2.5 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Timed examinations your students can sit, and your teachers can trust.
          </h1>
          <p className="text-fg-muted mt-4 max-w-2xl text-base">
            Quorlyn runs quizzes across every subject — physics, chemistry,
            mathematics — in Bangla and English, with a marking and results
            pipeline that holds up after the exam is over.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <ButtonLink href="/login" size="lg">
              Sign in
            </ButtonLink>
            <ButtonLink href="/join" size="lg" variant="secondary">
              Join with a code
            </ButtonLink>
          </div>
        </section>

        <section className="grid gap-3.5 pb-16 sm:grid-cols-2">
          {FEATURES.map(({ icon: Glyph, title, body }) => (
            <article
              key={title}
              className="border-border bg-surface rounded-card border p-4 shadow-sm"
            >
              <span className="bg-primary-soft text-primary inline-flex rounded-md p-2">
                <Glyph />
              </span>
              <h2 className="text-fg mt-2.5 text-sm font-semibold">{title}</h2>
              <p className="text-fg-muted mt-1.5 text-sm leading-relaxed">{body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-border mx-auto w-full max-w-6xl border-t px-6 py-6">
        <p className="text-fg-subtle text-xs">
          Quorlyn — multi-tenant examinations. One account works across every
          organization you belong to.
        </p>
      </footer>
    </div>
  );
}
