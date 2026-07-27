import Link from "next/link"
import { NoteSummary } from "@/lib/api"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Mobile: a two-column masonry of cards (CSS columns), Xiaohongshu-style.
// Desktop: a single-column, newspaper-style list — hairline dividers
// instead of card boxes, with the lead (first) note set larger. These are
// two separate render passes rather than one shared markup with
// conditional classes, since the two layouts are structurally different
// (columns vs. a flex list), not just restyled. Shared by /feed and
// /search so both present notes the same way.
export function NoteList({ notes }: { notes: NoteSummary[] }) {
  return (
    <>
      <div className="columns-2 gap-4 lg:hidden">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="mb-4 block break-inside-avoid"
          >
            <Card>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  {note.author} · {formatDate(note.publishedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{note.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="hidden lg:flex lg:flex-col">
        {notes.map((note, i) => (
          <NewspaperRow key={note.id} note={note} lead={i === 0} />
        ))}
      </div>
    </>
  )
}

function NewspaperRow({ note, lead }: { note: NoteSummary; lead: boolean }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="group border-b border-border py-6 first:pt-0 last:border-b-0"
    >
      <h2
        className={
          lead
            ? "text-3xl font-semibold leading-snug group-hover:underline"
            : "text-xl font-semibold leading-snug group-hover:underline"
        }
      >
        {note.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {note.author} · {formatDate(note.publishedAt)}
      </p>
      <p className={lead ? "mt-3 text-lg text-foreground/80" : "mt-2 text-base text-foreground/80"}>
        {note.excerpt}
      </p>
    </Link>
  )
}
