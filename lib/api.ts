import { TreeNode } from "./tree"

// Phase 2 — real backend (see CLAUDE.md's Data Access Rule). Talks to
// digitalgarden-backend's still-temporary hardcoded endpoint; will move
// to a real /api/notes/:id route once the backend has one.
const BASE = process.env.API_URL ?? "http://localhost:8080"

export async function getNote(): Promise<TreeNode> {
  const res = await fetch(`${BASE}/api/notes/hello-world`)
  return res.json()
}
