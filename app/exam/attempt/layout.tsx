/** Its own route tree: full-screen, no sidebar/topbar, own heartbeat/autosave loops. */
export default function ExamAttemptLayout({ children }: LayoutProps<"/exam/attempt">) {
  return <div className="min-h-dvh">{children}</div>;
}
