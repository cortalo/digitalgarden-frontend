import { Suspense } from "react"
import { searchNotes } from "@/lib/api"
import { NoteList } from "@/app/components/note-list"
import { SearchForm } from "@/app/components/search-form"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q ?? ""
  const results = query ? await searchNotes(query) : []

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      {/* Desktop already has a persistent search box in TopNav — this
          page's own form is only needed where that's hidden (mobile,
          since BottomNav's Search tab is just an icon/link). */}
      <Suspense fallback={<div className="max-w-md lg:hidden" />}>
        <SearchForm className="max-w-md lg:hidden" />
      </Suspense>

      {query && results.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          No notes found for &ldquo;{query}&rdquo;.
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-8">
          <NoteList notes={results} />
        </div>
      )}
    </main>
  )
}
