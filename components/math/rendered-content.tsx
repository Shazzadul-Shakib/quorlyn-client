import { convertLatexToMarkup } from "mathlive/ssr";
import { cn } from "@/lib/utils";
import type { ContentFormat, Language } from "@/types/api";

/**
 * `$…$` inline, `$$…$$` display, `\$` a literal dollar; everything else is
 * plain text. Matches the backend's validator (ADR-0020) so authoring and
 * exam views can never disagree.
 */
const MATH_SEGMENT = /(\$\$[\s\S]+?\$\$|\$(?:\\\$|[^$\n])+?\$)/g;

function markup(latex: string, displayMode: boolean): string {
  try {
    return convertLatexToMarkup(latex, {
      defaultMode: displayMode ? "math" : "inline-math",
    });
  } catch {
    // Never blank a question because one formula failed to parse.
    return escapeHtml(latex);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/**
 * Renders on the server: reading a question ships no MathLive JavaScript.
 * The markup comes from MathLive's own converter over content the API has
 * already rejected HTML from, so it is not user HTML being echoed back.
 */
export function RenderedContent({
  value,
  format,
  language,
  className,
}: {
  value: string;
  format: ContentFormat;
  language?: Language;
  className?: string;
}) {
  const lang = language === "BN" ? "bn" : undefined;

  if (format === "PLAIN") {
    return (
      <span lang={lang} className={cn("text-content whitespace-pre-wrap", className)}>
        {value}
      </span>
    );
  }

  const segments = value.split(MATH_SEGMENT).filter((segment) => segment !== "");

  return (
    <span lang={lang} className={cn("text-content", className)}>
      {segments.map((segment, index) => {
        const isDisplay = segment.startsWith("$$") && segment.endsWith("$$");
        const isInline =
          !isDisplay && segment.startsWith("$") && segment.endsWith("$");

        if (!isDisplay && !isInline) {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {segment.replaceAll("\\$", "$")}
            </span>
          );
        }

        const latex = segment.slice(isDisplay ? 2 : 1, isDisplay ? -2 : -1);
        return (
          <span
            key={index}
            className={cn("math-content", isDisplay ? "my-2 block" : "inline-block")}
            dangerouslySetInnerHTML={{ __html: markup(latex, isDisplay) }}
          />
        );
      })}
    </span>
  );
}
