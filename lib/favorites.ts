import { NoteSummary } from "./api"

// Favorites are purely a browser-local concept for now — there's no
// backend endpoint for them (see CLAUDE.md's Data Access Rule: this is
// deliberately outside lib/api.ts, since it's not backend data access at
// all, just localStorage). Not tied to login: whoever's using this
// browser gets their own favorites, signed in or not.
const STORAGE_KEY = "digitalgarden:favorites"

function readAll(): NoteSummary[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(notes: NoteSummary[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

export function getFavorites(): NoteSummary[] {
  return readAll()
}

export function isFavorite(slug: string): boolean {
  return readAll().some((n) => n.slug === slug)
}

export function addFavorite(note: NoteSummary): void {
  const all = readAll()
  if (all.some((n) => n.slug === note.slug)) return
  writeAll([note, ...all])
}

export function removeFavorite(slug: string): void {
  writeAll(readAll().filter((n) => n.slug !== slug))
}
