import Link from "next/link"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/app/components/search-form"

// Desktop-only header — mobile's equivalent actions live in BottomNav.
export function TopNav() {
  return (
    <header className="hidden border-b border-border lg:block">
      <div className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
        <Link href="/feed" className="shrink-0 text-lg font-semibold">
          digitalgarden
        </Link>
        <SearchForm className="max-w-sm flex-1" />
        <div className="ml-auto flex items-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Button render={<Link href="/publish" />} nativeButton={false} size="sm">
            Publish
          </Button>
          <Button
            render={<Link href="/login" aria-label="Account" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
          >
            <User className="size-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
