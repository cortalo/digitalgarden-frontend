import { TriangleAlert } from "lucide-react"

// Stands in for a plugin diagram (tikzBlock, wavedromBlock) that failed
// to render — see lib/diagram.ts — so one bad diagram costs only its own
// space on the page. The source stays reachable, collapsed, since it's
// the only form of the diagram left and the author needs it to see what
// to fix.
export function DiagramError({
  kind,
  source,
  reason,
}: {
  kind: string
  source: string
  reason: string
}) {
  return (
    <div className="not-prose my-6 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
        <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
        <span>This {kind} diagram couldn&apos;t be rendered.</span>
      </div>
      <p className="mt-1 text-zinc-500 dark:text-zinc-400">{reason}</p>
      <details className="mt-2">
        <summary className="cursor-pointer text-zinc-600 select-none dark:text-zinc-400">
          Show source
        </summary>
        <pre className="mt-2 overflow-x-auto rounded bg-zinc-100 p-3 text-xs text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
          <code>{source}</code>
        </pre>
      </details>
    </div>
  )
}
