import { TreeNode } from "./tree"

// Phase 2 — real backend (see CLAUDE.md's Data Access Rule).
const BASE = process.env.API_URL ?? "http://localhost:8080"

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
  tree: TreeNode
}

// GET /api/notes/:slug. Returns null on a 404 (no such note) rather than
// throwing — the caller decides what to do (notFound(), etc).
export async function getNote(slug: string): Promise<Note | null> {
  const res = await fetch(`${BASE}/api/notes/${slug}`)
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

// No search endpoint exists on the backend yet, so this fetches the feed
// and filters client-side by title/excerpt substring match. Phase 1-style
// mock behavior layered on otherwise-real Phase 2 data.
export async function searchNotes(query: string): Promise<NoteSummary[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const notes = await getNotes(100)
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(q) ||
      note.excerpt.toLowerCase().includes(q)
  )
}
