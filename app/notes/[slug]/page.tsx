import { notFound } from "next/navigation"
import { revalidateTag } from "next/cache"
import { Download, RotateCw } from "lucide-react"
import { auth } from "@/auth"
import { getNote, noteDownloadUrl, noteCacheTag } from "@/lib/api"
import { isNoteAuthor } from "@/lib/authz"
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
  const [note, session] = await Promise.all([getNote(slug), auth()])
  if (!note) notFound()

  const canRefresh = isNoteAuthor(session, note.author_user_id)

  // Re-checks authorship inside the action itself, not just by hiding
  // the button — a Server Action is a real callable endpoint regardless
  // of whether the client that renders it shows the button, so gating
  // only in the JSX above wouldn't actually stop anyone else from
  // invalidating this note's cache on demand.
  const authorUserId = note.author_user_id
  async function refresh() {
    "use server"
    const session = await auth()
    if (!isNoteAuthor(session, authorUserId)) return
    // "max" — this Next.js version requires a cache-life profile as the
    // second argument now (a bare single-arg call is deprecated); "max"
    // matches getNote()'s force-cache (no auto-expiry, invalidated only
    // on demand, which is exactly this call).
    revalidateTag(noteCacheTag(slug), "max")
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          {note.author} · {formatDate(note.published_at)}
        </p>
        <div className="flex items-center gap-1">
          {canRefresh && (
            <form action={refresh}>
              <Button type="submit" variant="ghost" size="sm" className="gap-1.5">
                <RotateCw className="size-4" />
                Refresh
              </Button>
            </form>
          )}
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
