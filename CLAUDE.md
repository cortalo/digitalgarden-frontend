# digitalgarden-frontend

A platform where users log in, publish an Obsidian note to a public web
page, and a homepage shows a feed of notes published by all users.
Sibling backend repo: `../digitalgarden-backend`.

# Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**, plus the **Typography plugin** (`@tailwindcss/
  typography`) for rendering note content — see "UI Style" below for why
  this is separate from shadcn.
- **shadcn/ui** — for app chrome only (buttons, inputs, dialogs, cards
  in nav/login/publish flows). Use these instead of hand-writing them.
- **Lucide React** — icons. Never emoji as icons in the UI.
- **React Hook Form + Zod** — the publish flow's form state/validation.
- **Auth.js v5** (next-auth) — Google OAuth, same as the sibling
  `onlineshopping-frontend` project.
- **`@excalidraw/excalidraw`** (and similarly one official library per
  supported plugin type later) — mounted in read-only/view mode to
  render plugin-content nodes. See "Node rendering" below.
- **Vercel** — deployment.

Stick to this stack; add other standard libraries on top as needed.

# Core architectural decision: this frontend is intentionally thin

The user is strong in Go, weak in frontend/Next.js. As much of the real
complexity as technically possible was pushed into the Go backend by
design — this frontend should stay a rendering layer, not grow its own
business logic. Don't reach for a JS markdown parser (remark/rehype or
similar) here — that would duplicate work the backend already does and
undo the reason this split exists.

# What the backend API gives you

A published note comes back from the backend **already parsed** into a
JSON tree of typed nodes (heading, paragraph, list, wikilink,
embedded-plugin-block, etc.) — never raw markdown text. Rendering is:
walk the tree, dispatch on `node.type` to a small component per type.
If you find yourself needing to parse markdown syntax here, something's
wrong — that job belongs in the backend (see its CLAUDE.md).

# Node rendering: two tiers

- **Structural nodes** (heading, paragraph, list, a resolved wikilink
  as a plain link, etc.): map directly to plain native HTML elements.
  No real logic — this is the bulk of what rendering looks like here.
- **Plugin nodes** (Excalidraw drawings, and later maybe Mermaid/Tikz
  diagrams): the backend extracts and hands you their structured data
  (e.g. Excalidraw's JSON payload), but *visually rendering* them is
  unavoidably a frontend job — these plugins' official renderers are
  browser-only libraries with no Go equivalent (Excalidraw ships
  `@excalidraw/excalidraw`, a React component). Mount the plugin's own
  official component in **read-only/view mode** (e.g. Excalidraw's
  `viewModeEnabled` prop) fed the data the backend already parsed out —
  don't build a custom renderer for these from scratch. Keep this to a
  small, fixed set of adapter components; don't let it grow into general
  frontend business logic.

# UI Style

The app should look like it came from a professional team — clean,
neutral, consistent. This applies to **app chrome** (nav, login form,
publish flow, feed list cards) — it does **not** apply to rendered note
content itself.

**App chrome** *(strict)*: shadcn/ui for all interactive elements, Lucide
for all icons, neutral colors (Tailwind `zinc`/`slate`), one accent color
used sparingly. Every data-fetching interaction handles loading (skeleton/
spinner, not plain text), error (clear inline message), and empty states.

**Rendered note content** is user-authored, arbitrary in length and
shape — treat it as an article/blog body, not app UI. Don't wrap
structural nodes (headings, paragraphs) in shadcn components (a Card
around every paragraph is wrong); use plain semantic HTML with Tailwind
Typography's `prose` classes for readable defaults instead.

# Working Style

For any non-trivial task:

1. **Plan first.** List the steps before writing any code. Wait for
   confirmation before starting.
2. **One step at a time.** Complete one step, then stop. The user will
   commit, test, and say when to continue.
3. **Never finish the whole task in one go.** Even if the steps seem
   straightforward, do them one at a time.

Flag any requirement that conflicts with good software design practice
and suggest a better approach before implementing.

# Project Structure

```
app/
  feed/               # public homepage: feed of published notes
  notes/[id]/         # a single published note's page
  publish/            # upload/publish flow
  components/
    render-tree.tsx   # node.type -> component dispatch (the tree walker)
    nodes/            # one component per node type (Heading, Paragraph,
                       # ExcalidrawEmbed, ...)
  login/
  page.tsx            # landing page
lib/
  api.ts              # all data functions
auth.ts                # Auth.js config
```

New feature pages go under `app/<feature>/`. Shared components go under
`app/components/`.

# Auth Pattern

Same two-file pattern as `onlineshopping-frontend`:

- `page.tsx` (Server Component) — calls `auth()`, redirects to `/login`
  if not logged in, passes `token` as a prop to the client component.
  No UI here.
- `*Client.tsx` (Client Component) — receives `token` as a prop, handles
  all UI and data fetching.

Never call `auth()` inside a `'use client'` component — hard technical
constraint, not a preference. The two-file split itself is a guideline;
use judgment if a specific case calls for something else.

# Data Access Rule

> **This is the most important rule in this file.** It's what makes the
> frontend and backend independently developable.

All data reads/writes go through `lib/api.ts`. Never call `fetch()`
directly inside components/pages.

**Phase 1 — in-memory mock (AI writes this).** Functions in `lib/api.ts`
return hardcoded/mock data — no real HTTP calls. This is the right mode
for early work like Step 1's validation slice: mock a note's already-
parsed JSON tree in `getNote()` and confirm `render-tree.tsx` can walk
it correctly, before the backend has a real endpoint to call.

```typescript
// lib/api.ts
let notes: Note[] = [{ id: 1, title: "Hello World", tree: { type: "root", children: [...] } }]

export async function getNote(id: number): Promise<Note | null> {
  return notes.find(n => n.id === id) ?? null
}
```

**Phase 2 — real backend (AI writes this too).** Once the backend has a
real endpoint, replace only the function bodies in `lib/api.ts` with
real `fetch()` calls against `digitalgarden-backend`'s API. Components
and pages never change between phases — this whole file's functions are
still AI-written, just swapped from mock data to live HTTP calls.

```typescript
export async function getNote(id: number): Promise<Note | null> {
  const res = await fetch(`${BASE}/api/notes/${id}`)
  if (res.status === 404) return null
  return res.json()
}
```

# Non-goals for this frontend

- No client-side markdown parsing.
- No support for uploading a whole vault/zip, Git sync, or an Obsidian
  plugin push flow — v1 is "publish one note," handled by picking a
  single `.md` file (+ its referenced attachments) and sending it to the
  backend. Don't build toward bulk import unless asked.
