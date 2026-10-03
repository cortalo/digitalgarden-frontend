// What every plugin-node renderer (lib/tikz.ts, lib/wavedrom.ts) hands
// back: an SVG, or the reason there isn't one. A failure is a value, not
// a throw, so a bad diagram degrades to a placeholder (DiagramError)
// instead of failing the rest of the page.
export type DiagramResult = { ok: true; svg: string } | { ok: false; reason: string }
