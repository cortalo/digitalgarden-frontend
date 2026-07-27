import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Native GET form — submitting navigates to /search?q=... with no client
// JS needed, so this stays a plain Server Component.
export function SearchForm({
  defaultValue,
  className,
}: {
  defaultValue?: string
  className?: string
}) {
  return (
    <form action="/search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Search notes"
          className="pl-8"
        />
      </div>
    </form>
  )
}
