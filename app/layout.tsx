import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import Script from "next/script";
import { ConfirmProvider } from "@/components/ui/confirm-provider";
import { Toaster } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Bengali glyphs fall through to this face from the same font stack. */
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bangla",
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Quorlyn", template: "%s · Quorlyn" },
  description:
    "Timed online examinations for schools — quizzes in Bangla and English with mathematics, physics and chemistry notation.",
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("quorlyn.theme");if(t==="dark"||t==="light"){document.documentElement.classList.add(t)}}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} h-full antialiased`}
    >
      <head>
        {/* Applies a stored theme override before first paint. Without it the
            page renders at the system preference and then flips. Using
            next/script (beforeInteractive) instead of a raw <script> tag —
            still the idiomatic Next.js way to do this, even though it does
            not fully eliminate every dev-mode "script tag" console warning
            (see docs/BUILD-PROGRESS.md — the alternative, resolving the
            theme from a cookie in this layout, was tried and reverted: it
            forces the whole app into dynamic rendering, losing static
            prerendering for `/` and `/_not-found`, which costs more than
            the warning does). */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body className="bg-canvas text-fg flex min-h-full flex-col">
        <ConfirmProvider>{children}</ConfirmProvider>
        <Toaster />
      </body>
    </html>
  );
}
