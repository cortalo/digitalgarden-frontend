import { redirect } from "next/navigation"
import Image from "next/image"
import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"

// No client-side data fetching or interactivity beyond a server-action
// sign-out form, so this stays a single Server Component rather than the
// page.tsx/*Client.tsx split (see CLAUDE.md's Auth Pattern — the split is
// a guideline, not a hard rule).
export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : null}
        <div>
          <p className="font-medium">{session.user?.name}</p>
          <p className="text-sm text-muted-foreground">{session.user?.email}</p>
        </div>
      </div>

      <form
        action={async () => {
          "use server"
          await signOut({ redirectTo: "/feed" })
        }}
        className="mt-8"
      >
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </main>
  )
}
