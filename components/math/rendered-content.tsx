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
    // `defaultMode` only controls math-vs-text parsing, not size — MathLive
    // renders `"math"` and `"inline-math"` identically. The actual
    // display/text sizing (e.g. a `\lim` stacking below vs. beside, a
    // fraction shrinking) comes from TeX's own style switch, so it has to be
    // in the LaTeX source itself.
    const styled = `${displayMode ? "\\displaystyle" : "\\textstyle"} ${latex}`;
    return convertLatexToMarkup(styled, { defaultMode: "math" });
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
            // Inline math stays a plain `inline` span: MathLive bakes a
            // baseline-aligning strut into its own markup, which only works
            // if the browser treats this as ordinary inline content. Making
            // it `inline-block` (or giving it non-visible `overflow`) makes
            // the browser discard that strut and use the box's bottom edge
            // as its baseline instead — text next to it then floats at the
            // formula's *bottom*, not its middle, which is the misalignment
            // this fixes. Display math has no such constraint, so it's free
            // to scroll instead of overflowing the page on a long equation.
            className={cn(
              "math-content",
              isDisplay && "my-2 block max-w-full overflow-x-auto overflow-y-hidden",
            )}
            dangerouslySetInnerHTML={{ __html: markup(latex, isDisplay) }}
          />
        );
      })}
    </span>
  );
}
