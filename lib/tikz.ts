import { unstable_cache } from "next/cache"
import tex2svg from "node-tikzjax"

// node-tikzjax cannot run concurrent renders in the same process (a
// documented limitation — concurrent calls throw, confirmed by testing).
// This chains every call onto the previous one so requests are serialized
// process-wide, which a public feed with concurrent readers requires.
let queue: Promise<unknown> = Promise.resolve()

function renderTikzUncached(source: string): Promise<string> {
  const result = queue.then(() => tex2svg(source))
  queue = result.catch(() => {})
  return result
}

// Compiling a TikZ picture to SVG is real LaTeX/PGF work, not a cheap
// string transform — confirmed directly that a pgfplots-style smooth
// curve (samples=100 inside a \foreach) alone took 3.4s, and this cost
// was being paid fresh on every single page render: getNote()'s cache
// only covers the note's raw data, not this derived compilation step.
// Cached here purely by content — source is part of what Next.js
// derives the cache key from — with no tags or expiry, since the same
// TikZ source always compiles to the same SVG: if a note's TikZ source
// ever changes, that's simply a different cache key, not something that
// needs explicit invalidation.
export const renderTikz = unstable_cache(renderTikzUncached, ["render-tikz"], {
  revalidate: false,
})
