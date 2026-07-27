import { getNote, getNotes } from "@/lib/api"
import { RenderTree } from "@/app/components/render-tree"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// The backend only has one real note behind a fixed endpoint so far (no
// per-id lookup), so every id renders the same tree for now — this page's
// job right now is validating the reading layout, not per-note data. The
// byline below is looked up from the feed's mocked summaries just so
// clicking different feed cards doesn't show identical bylines too.
export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [tree, notes] = await Promise.all([getNote(), getNotes()])
  const summary = notes.find((n) => String(n.id) === id)

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {summary && (
        <div className="mb-8 border-b border-border pb-6">
          <p className="text-sm text-muted-foreground">
            {summary.author} · {formatDate(summary.publishedAt)}
          </p>
        </div>
      )}
      <RenderTree node={tree} />
    </main>
  )
}
