import Link from "next/link"
import Image from "next/image"
import { Suspense } from "react"
import type { Session } from "next-auth"
import { Star, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchForm } from "@/app/components/search-form"

// Desktop-only header — mobile's equivalent actions live in BottomNav.
// session is fetched once in the root layout (a Server Component) and
// passed down, since auth() must never be called from a client component.
export function TopNav({ session }: { session: Session | null }) {
  return (
    <header className="hidden border-b border-border lg:block">
      <div className="mx-auto flex max-w-4xl items-center gap-6 px-6 py-4">
        <Link href="/feed" className="shrink-0 text-lg font-semibold">
          digitalgarden
        </Link>
        <Suspense fallback={<div className="max-w-sm flex-1" />}>
          <SearchForm className="max-w-sm flex-1" />
        </Suspense>
        <div className="ml-auto flex items-center gap-4">
          <Button render={<Link href="/favorites" aria-label="Favorites" />} nativeButton={false} variant="ghost" size="icon">
            <Star className="size-5" />
          </Button>
          <Button render={<Link href="/publish" />} nativeButton={false} size="sm">
            Publish
          </Button>
          <Button
            render={
              <Link
                href={session ? "/profile" : "/login"}
                aria-label={session ? "Profile" : "Sign in"}
              />
            }
            nativeButton={false}
            variant="ghost"
            size="icon"
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "avatar"}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <User className="size-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
