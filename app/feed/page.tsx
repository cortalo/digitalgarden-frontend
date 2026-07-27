import { getNotes } from "@/lib/api"
import { NoteList } from "@/app/components/note-list"

export default async function FeedPage() {
  const notes = await getNotes()

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <NoteList notes={notes} />
    </main>
  )
}
