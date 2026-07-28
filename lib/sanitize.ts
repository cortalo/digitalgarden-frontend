import DOMPurify from "dompurify"

// Client-only, deliberately. The previous attempt used isomorphic-dompurify
// (DOMPurify + a bundled jsdom) so svgBlock could be sanitized during
// server rendering, but jsdom's own dependency chain has an ESM file
// Turbopack's bundler can't require() as CJS — that broke the Vercel
// deploy. Plain browser dompurify has no such dependency, but it also has
// no windowless fallback: confirmed directly that in a window-less Node
// process, the imported DOMPurify factory doesn't even expose .sanitize
// or .addHook (they're undefined, not a stub). So this must never be
// called during server rendering — see SvgBlock.tsx, which only calls it
// inside a useEffect (i.e. after the browser, not the server, has run
// this code).
let hookRegistered = false

function ensureHook() {
  if (hookRegistered) return
  // DOMPurify's svg profile excludes <use> outright, not just unsafe
  // attributes on it — a diagram built from <defs><symbol> + <use> loses
  // every instance otherwise. <use> is allowed back in via
  // ADD_TAGS/ADD_ATTR below, but this hook restricts its href/xlink:href
  // to same-document fragment refs (#foo), so the tag we just re-allowed
  // can't be used to reference external content.
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName?.toLowerCase() !== "use") return
    for (const attr of ["href", "xlink:href"]) {
      const value = node.getAttribute(attr)
      if (value && !value.startsWith("#")) {
        node.removeAttribute(attr)
      }
    }
  })
  hookRegistered = true
}

export function sanitizeSvg(raw: string): string {
  ensureHook()
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ["use"],
    ADD_ATTR: ["href", "xlink:href"],
  })
}
