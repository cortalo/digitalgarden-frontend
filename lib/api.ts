import { TreeNode } from "./tree"

// Phase 2 — real backend (see CLAUDE.md's Data Access Rule).
const BASE = process.env.API_URL ?? "http://localhost:8080"

// publishNote() runs in the browser (called from PublishClient, a client
// component — see CLAUDE.md's Auth Pattern), so it needs the publicly
// exposed variant of the API URL rather than the server-only one above.
const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

export interface NoteSummary {
  id: number
  title: string
  slug: string
  author: string
  excerpt: string
  tags: string[]
  published_at: string
}

export interface Note extends NoteSummary {
  author_user_id: number
  tree: TreeNode
}

// Shared between getNote()'s cache tag and the refresh action's
// revalidateTag() call — both need to name the exact same tag.
export function noteCacheTag(slug: string): string {
  return `note:${slug}`
}

// GET /api/notes/:slug. Returns null on a 404 (no such note) rather than
// throwing — the caller decides what to do (notFound(), etc).
//
// Cached indefinitely (force-cache, no time-based revalidate) — a note's
// content never changes after publish except through the author's own
// manual refresh, which calls revalidateTag(noteCacheTag(slug)) to
// invalidate just this one entry. See app/notes/[slug]/page.tsx.
export async function getNote(slug: string): Promise<Note | null> {
  const res = await fetch(`${BASE}/api/notes/${slug}`, {
    cache: "force-cache",
    next: { tags: [noteCacheTag(slug)] },
  })
  if (res.status === 404) return null
  return res.json()
}

// GET /api/notes — the public feed, newest first. limit is capped and
// defaulted on the backend itself; passing it through here just avoids
// over-fetching when a caller (e.g. search) wants a wider page to filter
// over.
export async function getNotes(limit?: number): Promise<NoteSummary[]> {
  const url = new URL(`${BASE}/api/notes`)
  if (limit) url.searchParams.set("limit", String(limit))
  const res = await fetch(url)
  return res.json()
}

// A search result: the same card fields as NoteSummary, plus the
// snippets showing where the keyword actually matched (title, author,
// excerpt, and/or body — see the backend's noteservice.Search).
export interface SearchHit extends NoteSummary {
  snippets: string[]
}

// GET /api/notes/search?q=. Public, same access level as getNotes().
export async function searchNotes(query: string): Promise<SearchHit[]> {
  const q = query.trim()
  if (!q) return []
  const url = new URL(`${BASE}/api/notes/search`)
  url.searchParams.set("q", q)
  const res = await fetch(url)
  return res.json()
}

// GET /api/notes/:slug/download — not a fetch, just the URL a plain <a
// href download> points at so the browser handles the download itself
// (the backend sets Content-Disposition: attachment). Public, same as
// getNote(). Uses the public base since it's followed directly by the
// browser, not requested from our own server.
export function noteDownloadUrl(slug: string): string {
  return `${PUBLIC_BASE}/api/notes/${slug}/download`
}

export interface PublishInput {
  title: string
  markdown: string
  slug?: string
  excerpt?: string
}

// POST /api/notes, behind the backend's RequireAuth — token is the
// session's backendToken (the JWT digitalgarden-backend's own login
// issued, not Google's). v1 is text-only, matching CLAUDE.md's Upload
// scope: no attachment upload yet.
export async function publishNote(token: string, input: PublishInput): Promise<Note> {
  const res = await fetch(`${PUBLIC_BASE}/api/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Publish failed (${res.status})`)
  }
  return res.json()
}
