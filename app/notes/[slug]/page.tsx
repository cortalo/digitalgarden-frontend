import { notFound } from "next/navigation"
import { getNote } from "@/lib/api"
import { RenderTree } from "@/app/components/render-tree"
import { FavoriteButton } from "@/app/components/favorite-button"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = await getNote(slug)
  if (!note) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          {note.author} · {formatDate(note.published_at)}
        </p>
        <FavoriteButton note={note} />
      </div>
      <RenderTree node={note.tree} />
    </main>
  )
}
