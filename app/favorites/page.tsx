"use client"

import { useEffect, useState } from "react"
import { NoteSummary } from "@/lib/api"
import { getFavorites } from "@/lib/favorites"
import { NoteList } from "@/app/components/note-list"

// Favorites live in localStorage (see lib/favorites.ts), so this has
// nothing to fetch from the server — it's a client component reading
// browser storage on mount, not a page.tsx/*Client.tsx split.
export default function FavoritesPage() {
  const [notes, setNotes] = useState<NoteSummary[] | null>(null)

  useEffect(() => {
    setNotes(getFavorites())
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="mb-8 text-2xl font-semibold">Favorites</h1>
      {notes === null ? null : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Notes you favorite will show up here.
        </p>
      ) : (
        <NoteList notes={notes} />
      )}
    </main>
  )
}
