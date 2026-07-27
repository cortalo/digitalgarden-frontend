import { redirect } from "next/navigation"

// Superseded by /feed + /notes/[slug] (see CLAUDE.md's Project
// Structure) — no real landing page designed yet, so root just forwards
// to the feed instead of leaving Step 1's now-broken validation page up.
export default function Home() {
  redirect("/feed")
}
