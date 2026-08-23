import type { MathfieldElement } from "mathlive";

/**
 * MathLive is a custom element; React needs it declared once rather than
 * cast at each use site.
 */
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<MathfieldElement>,
        MathfieldElement
      > & {
        ref?: React.Ref<MathfieldElement>;
      };
    }
  }
}

export {};
