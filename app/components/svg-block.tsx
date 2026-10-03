"use client"

import { useEffect, useRef } from "react"
import { sanitizeSvg } from "@/lib/sanitize"

// Sanitizing and injecting happens only inside useEffect — i.e. only in
// the browser, after mount — never in the render body. Client components
// still get rendered once on the server for the initial HTML, and
// sanitizeSvg() isn't safe to call there (see lib/sanitize.ts). The
// tradeoff: the diagram is empty until client JS hydrates, instead of
// present in the initial server-rendered HTML.
//
// The default className is for svgBlock: Obsidian's SVG Editor plugin
// exports these with a viewBox but no width/height attribute, which —
// confirmed by actually rendering one — collapses the injected <svg> to
// 0×0 rather than falling back to some default size, so it's forced to
// fill the container at its own aspect ratio. Callers whose SVGs carry
// their own width/height (WaveDrom) pass their own instead.
export function SvgBlock({
  text,
  className = "[&>svg]:h-auto [&>svg]:w-full",
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = sanitizeSvg(text)
    }
  }, [text])

  return <div ref={ref} className={className} />
}
