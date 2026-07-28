"use client"

import { useEffect, useRef } from "react"
import { sanitizeSvg } from "@/lib/sanitize"

// Sanitizing and injecting happens only inside useEffect — i.e. only in
// the browser, after mount — never in the render body. Client components
// still get rendered once on the server for the initial HTML, and
// sanitizeSvg() isn't safe to call there (see lib/sanitize.ts). The
// tradeoff: the diagram is empty until client JS hydrates, instead of
// present in the initial server-rendered HTML.
export function SvgBlock({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = sanitizeSvg(text)
    }
  }, [text])

  // Obsidian's SVG Editor plugin exports these with a viewBox but no
  // width/height attribute, which — confirmed by actually rendering one —
  // collapses the injected <svg> to 0×0 rather than falling back to some
  // default size. Force it to fill the container at its own aspect ratio.
  return <div ref={ref} className="[&>svg]:h-auto [&>svg]:w-full" />
}
