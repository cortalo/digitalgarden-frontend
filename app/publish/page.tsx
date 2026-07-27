// Placeholder — the real publish flow (pick a .md file + attachments,
// upload, auth-gated) isn't built yet. This just gives the nav's Publish
// button somewhere to land instead of a 404.
export default function PublishPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Publish</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The publish flow isn&apos;t built yet.
      </p>
    </main>
  )
}
