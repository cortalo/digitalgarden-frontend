import { TreeNode } from "./tree"

// Phase 2 — real backend (see CLAUDE.md's Data Access Rule). Talks to
// digitalgarden-backend's still-temporary hardcoded endpoint; will move
// to a real /api/notes/:id route once the backend has one.
const BASE = process.env.API_URL ?? "http://localhost:8080"

export async function getNote(): Promise<TreeNode> {
  const res = await fetch(`${BASE}/api/notes/hello-world`)
  return res.json()
}

export interface NoteSummary {
  id: number
  title: string
  excerpt: string
  author: string
  publishedAt: string
}

// Phase 1 — in-memory mock (see CLAUDE.md's Data Access Rule). The backend
// has no feed-listing endpoint yet, only the single hardcoded note — this
// stands in for that until one exists, purely to validate the feed UI.
const noteSummaries: NoteSummary[] = [
  {
    id: 1,
    title: "Hello World",
    excerpt: "This is a paragraph. A short first note to validate the pipeline end to end.",
    author: "Ada Lovelace",
    publishedAt: "2026-07-01",
  },
  {
    id: 2,
    title: "On the mass-energy equivalence and why it still surprises me",
    excerpt:
      "Revisiting Einstein's famous equation and what it actually means for how we think about matter, energy, and the speed of light as a conversion factor between the two.",
    author: "Marie Curie",
    publishedAt: "2026-07-05",
  },
  {
    id: 3,
    title: "TikZ diagrams in Obsidian",
    excerpt: "A quick circle, drawn in LaTeX, rendered on the web.",
    author: "Donald Knuth",
    publishedAt: "2026-07-10",
  },
  {
    id: 4,
    title: "Go concurrency patterns I keep coming back to",
    excerpt:
      "Channels, worker pools, and the handful of shapes that cover almost every concurrent Go program I've written, plus a couple of mistakes worth naming.",
    author: "Rob Pike",
    publishedAt: "2026-07-14",
  },
  {
    id: 5,
    title: "A short note on tea",
    excerpt: "Water just off the boil. That's most of it.",
    author: "Ada Lovelace",
    publishedAt: "2026-07-18",
  },
  {
    id: 6,
    title: "Reading notes: goldmark's extension system",
    excerpt:
      "How goldmark lets you hook into parsing without forking the library, and why that made the mathjax and wikilink extensions straightforward to bolt on.",
    author: "Rob Pike",
    publishedAt: "2026-07-22",
  },
]

export async function getNotes(): Promise<NoteSummary[]> {
  return noteSummaries
}

// Phase 1 — in-memory mock, same as getNotes(). No search endpoint exists
// on the backend yet, so this just filters the mocked list client-side by
// title/excerpt substring match.
export async function searchNotes(query: string): Promise<NoteSummary[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return noteSummaries.filter(
    (note) =>
      note.title.toLowerCase().includes(q) ||
      note.excerpt.toLowerCase().includes(q)
  )
}
