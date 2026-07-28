"use client"

import { Search } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"

// Reads the current ?q= itself (via useSearchParams) rather than taking
// it as a prop, so every SearchForm on screen — TopNav's persistent one
// included, which is rendered from the root layout and has no per-page
// searchParams to pass down — shows the active query after a search,
// not just the one on /search's own page.
export function SearchForm({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const q = searchParams.get("q") ?? ""

  return (
    <form action="/search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={q}
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search notes"
          className="pl-8"
        />
      </div>
    </form>
  )
}
