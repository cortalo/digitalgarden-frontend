"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import type { PublishInput, Note } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function EditClient({
  save,
  initialTitle,
  initialSlug,
  initialExcerpt,
  initialMarkdown,
}: {
  save: (input: PublishInput) => Promise<Note>
  initialTitle: string
  initialSlug: string
  initialExcerpt: string
  initialMarkdown: string
}) {
  const router = useRouter()
  const [fileName, setFileName] = useState("")
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [excerpt, setExcerpt] = useState(initialExcerpt)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Unlike PublishClient's handleFile, this never touches title/slug —
  // both already have real values from the existing note, so a replaced
  // file should only ever update the content.
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setMarkdown(await file.text())
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const updated = await save({
        title,
        markdown,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
      })
      router.push(`/notes/${updated.slug}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed")
      setSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-semibold">Edit note</h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label htmlFor="file" className="text-sm font-medium">
            Markdown file{" "}
            <span className="text-muted-foreground">
              (optional — keeps the current content if you don&apos;t pick a new one)
            </span>
          </label>
          <label
            htmlFor="file"
            className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
          >
            <Upload className="size-4" />
            {fileName || "Choose a .md file to replace the content"}
          </label>
          <input
            id="file"
            type="file"
            accept=".md"
            onChange={handleFile}
            className="sr-only"
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
            Slug
          </label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
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
          {submitting ? "Saving…" : "Save"}
        </Button>
      </form>
    </main>
  )
}
