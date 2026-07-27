"use client"

import { useEffect, useState } from "react"
import { Star } from "lucide-react"
import { NoteSummary } from "@/lib/api"
import { isFavorite, addFavorite, removeFavorite } from "@/lib/favorites"
import { Button } from "@/components/ui/button"

// Read on mount rather than useState(() => isFavorite(...)) — localStorage
// isn't available during server rendering, and this component is used on
// a page whose surrounding content is server-rendered, so the initial
// render must match the server's (unfavorited) output to avoid a
// hydration mismatch.
export function FavoriteButton({ note }: { note: NoteSummary }) {
  const [favorited, setFavorited] = useState(false)

  useEffect(() => {
    setFavorited(isFavorite(note.slug))
  }, [note.slug])

  function toggle() {
    if (favorited) {
      removeFavorite(note.slug)
    } else {
      addFavorite(note)
    }
    setFavorited(!favorited)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-pressed={favorited}
      className="gap-1.5"
    >
      <Star className={favorited ? "size-4 fill-current" : "size-4"} />
      {favorited ? "Favorited" : "Favorite"}
    </Button>
  )
}
