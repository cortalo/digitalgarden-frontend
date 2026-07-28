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

// A note as NoteList needs it: NoteSummary, plus optional search
// snippets. /search passes SearchHit[] (NoteSummary + snippets); /feed
// passes plain NoteSummary[] with no snippets. Where a snippet exists,
// it replaces the excerpt so a search result shows *why* it matched
// rather than always the same fixed excerpt.
type ListableNote = NoteSummary & { snippets?: string[] }

// previewLines: all of a search hit's snippets, or the plain excerpt as
// a single line when there are none (the /feed case).
function previewLines(note: ListableNote): string[] {
  return note.snippets && note.snippets.length > 0 ? note.snippets : [note.excerpt]
}

// Snippets are the backend's raw OpenSearch highlight fragments — user-
// authored field text (title/excerpt/content) with literal <em>...</em>
// markers spliced in around the matched keyword, NOT html-escaped
// otherwise. Never dangerouslySetInnerHTML this — a note's own title or
// body could contain real markup and this would execute it (the same
// stored-XSS shape as svgBlock). Instead split on the two known literal
// tags ourselves and hand the pieces to React as plain text/elements, so
// arbitrary content in a piece is always rendered inert, never parsed.
function renderHighlighted(text: string) {
  return text.split(/<em>(.*?)<\/em>/).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-primary/20 text-foreground">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

// Mobile: a two-column masonry of cards (CSS columns), Xiaohongshu-style.
// Desktop: a single-column, newspaper-style list — hairline dividers
// instead of card boxes, with the lead (first) note set larger. These are
// two separate render passes rather than one shared markup with
// conditional classes, since the two layouts are structurally different
// (columns vs. a flex list), not just restyled. Shared by /feed and
// /search so both present notes the same way.
export function NoteList({ notes }: { notes: ListableNote[] }) {
  return (
    <>
      <div className="columns-2 gap-4 lg:hidden">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.slug}`}
            className="mb-4 block break-inside-avoid"
          >
            <Card>
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
                <CardDescription>
                  {note.author} · {formatDate(note.published_at)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {previewLines(note).map((line, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    {renderHighlighted(line)}
                  </p>
                ))}
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

function NewspaperRow({ note, lead }: { note: ListableNote; lead: boolean }) {
  return (
    <Link
      href={`/notes/${note.slug}`}
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
        {note.author} · {formatDate(note.published_at)}
      </p>
      <div className={lead ? "mt-3 space-y-1 text-lg text-foreground/80" : "mt-2 space-y-1 text-base text-foreground/80"}>
        {previewLines(note).map((line, i) => (
          <p key={i}>{renderHighlighted(line)}</p>
        ))}
      </div>
    </Link>
  )
}
