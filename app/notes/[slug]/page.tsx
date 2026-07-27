import { notFound } from "next/navigation"
import { Download } from "lucide-react"
import { getNote, noteDownloadUrl } from "@/lib/api"
import { RenderTree } from "@/app/components/render-tree"
import { FavoriteButton } from "@/app/components/favorite-button"
import { Button } from "@/components/ui/button"

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
        <div className="flex items-center gap-1">
          <Button
            render={<a href={noteDownloadUrl(note.slug)} download />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="gap-1.5"
          >
            <Download className="size-4" />
            Download
          </Button>
          <FavoriteButton note={note} />
        </div>
      </div>
      <RenderTree node={note.tree} />
    </main>
  )
}
