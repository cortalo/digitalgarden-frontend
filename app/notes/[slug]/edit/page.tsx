import { notFound, redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { auth } from "@/auth"
import {
  getNote,
  getNoteMarkdown,
  updateNote,
  noteCacheTag,
  type PublishInput,
  type Note,
} from "@/lib/api"
import { isNoteAuthor } from "@/lib/authz"
import { EditClient } from "./EditClient"

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [note, session] = await Promise.all([getNote(slug), auth()])
  if (!note) notFound()
  if (!isNoteAuthor(session, note.author_user_id)) redirect(`/notes/${slug}`)

  const markdown = await getNoteMarkdown(slug)

  // Re-checks authorship inside the action itself — same reasoning as
  // the note page's refresh/delete actions (a Server Action is a real
  // callable endpoint regardless of whether the page that renders it
  // gated access to it).
  const authorUserId = note.author_user_id
  async function save(input: PublishInput): Promise<Note> {
    "use server"
    const session = await auth()
    if (!session || !isNoteAuthor(session, authorUserId)) {
      throw new Error("Not authorized")
    }
    const updated = await updateNote(session.backendToken, slug, input)
    // updateTag, not revalidateTag(tag, "max") — see the note page's
    // refresh()/deleteAction() for why "max" doesn't actually mean
    // "invalidate now" here. The slug this note lives at may have just
    // changed — invalidate the old one so it stops serving a stale
    // cached copy (getNote() caches indefinitely otherwise); the new
    // slug has no cache entry yet, so updating it is a harmless no-op
    // rather than something skippable.
    updateTag(noteCacheTag(slug))
    updateTag(noteCacheTag(updated.slug))
    return updated
  }

  return (
    <EditClient
      save={save}
      initialTitle={note.title}
      initialSlug={note.slug}
      initialExcerpt={note.excerpt}
      initialMarkdown={markdown}
    />
  )
}
