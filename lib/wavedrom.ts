import { renderAny, waveSkin, onml } from "wavedrom"
import type { DiagramResult } from "./diagram"

// Renders a wavedromBlock's text to an SVG string. The backend already
// normalized the author's WaveJSON (a JS object literal) to strict JSON
// — see its normalizeWaveJSON — so JSON.parse is all that's needed here,
// never eval.
//
// That does NOT make the output safe to inject as-is: WaveDrom's rich
// text (head/foot `text` given as an onml array) describes arbitrary
// markup, and confirmed by testing that <script>, onclick and
// javascript: links written there come out verbatim in the SVG. The
// caller must pass the result through sanitizeSvg — see SvgBlock.
//
// Unlike TikZ this is plain synchronous JS taking milliseconds, and its
// errors are ordinary throws, so it needs neither the worker nor the
// cache lib/tikz.ts has.
export function renderWavedrom(text: string): DiagramResult {
  try {
    // index must be 0: renderSignal only loads the skin's lane geometry
    // into its module-level state when index === 0, otherwise reusing
    // whatever the previous render left there. The cost is that every
    // diagram on a page gets the same ids, which is harmless — the only
    // ids referenced inside the SVG are the skin's own <defs> (pclk,
    // arrowhead, ...), identical in every diagram.
    const tree = renderAny(0, JSON.parse(text), waveSkin)
    // A source with none of signal/reg/assign renders as an empty <div>
    // rather than throwing.
    if (tree[0] !== "svg") {
      return { ok: false, reason: "Not a WaveDrom signal, reg or assign diagram" }
    }
    return { ok: true, svg: scopeSkinStyles(onml.stringify(tree)) }
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}

const ROOT_CLASS = "WaveDrom"
const CLASS_PREFIX = "wavedrom-"

// The skin embeds a <style> with bare global selectors (text, .muted,
// .error, .info, .s1, ...). Inline in the page, those would restyle
// every other SVG's <text> and any element using those class names.
//
// Class selectors can't simply be scoped under .WaveDrom (the class
// renderAny puts on the root <svg>): a signal diagram's wave pieces are
// <use> references into <defs>, and browsers match selectors against a
// <use>'s clone inside its own shadow tree, where no .WaveDrom ancestor
// exists — confirmed by rendering one, every wave piece fell back to a
// solid black fill. So class names are renamed instead, in both the CSS
// and the markup's class attributes (which also covers rich-text classes
// like h1/muted an author writes in head/foot text); only element
// selectors (text) are scoped by ancestor.
//
// Done on the output string, not the onml tree, because the tree shares
// its style node with the imported skin object — mutating it would
// re-prefix on every later render.
function scopeSkinStyles(svg: string): string {
  const withStyles = svg.replace(
    /(<style[^>]*>)([\s\S]*?)(<\/style>)/g,
    (_, open: string, css: string, close: string) => {
      const scoped = css.replace(
        /(^|\})([^{}]+)\{/g,
        (_m, brace: string, selectors: string) =>
          brace +
          selectors
            .split(",")
            .map((s) => {
              const renamed = s.trim().replace(/\.([A-Za-z_][\w-]*)/g, `.${CLASS_PREFIX}$1`)
              return renamed.startsWith(".") ? renamed : `.${ROOT_CLASS} ${renamed}`
            })
            .join(",") +
          "{",
      )
      return open + scoped + close
    },
  )
  return withStyles.replace(/\bclass="([^"]*)"/g, (_, classes: string) => {
    const renamed = classes
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => (c === ROOT_CLASS ? c : CLASS_PREFIX + c))
      .join(" ")
    return `class="${renamed}"`
  })
}
