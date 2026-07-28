import { notFound, redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { Download, Pencil, RotateCw, Trash2 } from "lucide-react"
import { auth } from "@/auth"
import { getNote, deleteNote, noteDownloadUrl, noteCacheTag } from "@/lib/api"
import { isNoteAuthor } from "@/lib/authz"
import { RenderTree } from "@/app/components/render-tree"
import { FavoriteButton } from "@/app/components/favorite-button"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

  const isAuthor = isNoteAuthor(session, note.author_user_id)

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
    // updateTag, not revalidateTag(tag, "max") — "max" is one of
    // Next.js's built-in cache-life profiles (revalidate: 30 days,
    // expire: 1 year), so revalidateTag(tag, "max") only marks the tag
    // stale on a 30-day stale-while-revalidate window, not "invalidate
    // right now" (confirmed by testing: the old cached response kept
    // being served long after calling it). updateTag() is the actual
    // immediate-invalidation call, and is scoped to Server Actions only
    // — which is exactly where this runs.
    updateTag(noteCacheTag(slug))
  }

  // Same defense-in-depth as refresh() above. Deleting is a hard,
  // unrecoverable delete on the backend (no soft-delete) — invalidating
  // the tag afterward matters here, not just tidiness: getNote() caches
  // indefinitely, so without this a deleted note would keep serving its
  // last cached response forever instead of the 404 it should now be.
  async function deleteAction() {
    "use server"
    const session = await auth()
    if (!session || !isNoteAuthor(session, authorUserId)) return
    await deleteNote(session.backendToken, slug)
    updateTag(noteCacheTag(slug))
    redirect("/feed")
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <p className="text-sm text-muted-foreground">
          {note.author} · {formatDate(note.published_at)}
        </p>
        <div className="flex items-center gap-1">
          {isAuthor && (
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
          {isAuthor && (
            <Button
              render={<a href={`/notes/${note.slug}/edit`} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
          {isAuthor && (
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes &ldquo;{note.title}&rdquo;. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={deleteAction}>
                    <AlertDialogAction
                      type="submit"
                      className="w-full bg-destructive text-white hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <FavoriteButton note={note} />
        </div>
      </div>
      <RenderTree node={note.tree} />
    </main>
  )
}
