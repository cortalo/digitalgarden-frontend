"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import type { Session } from "next-auth"
import { Home, Search, SquarePlus, Info, User } from "lucide-react"
import { cn } from "@/lib/utils"

// Five items so Publish lands dead center with justify-around (four
// items straddle the midpoint instead of sitting on it). "Me" is a key,
// not a real href — its target depends on session, resolved below.
const items = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/publish", label: "Publish", icon: SquarePlus },
  { href: "/about", label: "About", icon: Info },
  { href: "me", label: "Me", icon: User },
]

// Mobile-only bottom tab bar, Xiaohongshu-style: the publish action sits
// in the middle as a raised accent-filled button instead of a plain tab.
// session is fetched once in the root layout (a Server Component) and
// passed down, since auth() must never be called from a client component.
export function BottomNav({ session }: { session: Session | null }) {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background lg:hidden">
      {items.map(({ href, label, icon: Icon }) => {
        if (href === "/publish") {
          return (
            <Link key={href} href={href} className="flex flex-col items-center">
              <span className="-mt-6 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                <Icon className="size-6" />
              </span>
            </Link>
          )
        }

        if (href === "me") {
          const meHref = session ? "/profile" : "/login"
          const active = pathname.startsWith(meHref)
          return (
            <Link
              key={href}
              href={meHref}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 text-xs",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "avatar"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
              )}
              {label}
            </Link>
          )
        }

        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 text-xs",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-6" strokeWidth={active ? 2.5 : 2} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
