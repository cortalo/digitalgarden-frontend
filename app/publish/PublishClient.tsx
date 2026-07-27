"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { publishNote } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mirrors the backend's note.Slugify exactly (lowercase, non-alphanumeric
// runs collapsed to one hyphen, leading/trailing hyphens trimmed) so the
// default shown here is what the backend would derive on its own anyway.
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// v1 is text-only, matching CLAUDE.md's Upload scope — pick a single .md
// file, no attachments. The file's content is read client-side (File API)
// and sent straight to the backend; nothing here parses markdown.
export function PublishClient({ token }: { token: string }) {
  const router = useRouter()
  const [fileName, setFileName] = useState("")
  const [markdown, setMarkdown] = useState("")
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setMarkdown(await file.text())
    if (!title) {
      const derivedTitle = file.name.replace(/\.md$/i, "")
      setTitle(derivedTitle)
      // Only defaulted here, at upload time — editing the title afterward
      // doesn't keep re-deriving the slug out from under the user.
      setSlug(slugify(derivedTitle))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const note = await publishNote(token, {
        title,
        markdown,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
      })
      router.push(`/notes/${note.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed")
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Publish a note</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="file" className="text-sm font-medium">
            Markdown file
          </label>
          <label
            htmlFor="file"
            className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
          >
            <Upload className="size-4" />
            {fileName || "Choose a .md file"}
          </label>
          <input
            id="file"
            type="file"
            accept=".md"
            onChange={handleFile}
            className="sr-only"
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium">
            Slug <span className="text-muted-foreground">(optional — defaults from the title)</span>
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={title ? slugify(title) : undefined}
            className="mt-1.5"
          />
        </div>

        <div>
          <label htmlFor="excerpt" className="text-sm font-medium">
            Excerpt <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Shown as the preview in the feed"
            className="mt-1.5"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={submitting} className="gap-2">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? "Publishing…" : "Publish"}
        </Button>
      </form>
    </main>
  )
}
