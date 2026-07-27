# digitalgarden-frontend

A platform where users log in, publish an Obsidian note to a public web
page, and a homepage shows a feed of notes published by all users.
Sibling backend repo: `../digitalgarden-backend`.

## Core architectural decision: this frontend is intentionally thin

The user is strong in Go, weak in frontend/Next.js. As much of the real
complexity as technically possible was pushed into the Go backend by
design — this frontend should stay a rendering layer, not grow its own
business logic. Don't reach for a JS markdown parser (remark/rehype or
similar) here — that would duplicate work the backend already does and
undo the reason this split exists.

## What the backend API gives you

A published note comes back from the backend **already parsed** into a
JSON tree of typed nodes (heading, paragraph, list, wikilink,
embedded-plugin-block, etc.) — never raw markdown text. Rendering is:
walk the tree, dispatch on `node.type` to a small component per type.
If you find yourself needing to parse markdown syntax here, something's
wrong — that job belongs in the backend (see its CLAUDE.md).

## Node rendering: two tiers

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

## Auth

Reuse the pattern from the sibling `../onlineshopping-frontend` project
if applicable once the backend's auth endpoints are built (Google OAuth
flow, JWT stored and sent as a Bearer token to the backend) — don't
re-derive this from scratch, check that project's `auth.ts` and
`lib/api.ts` first.

## Non-goals for this frontend

- No client-side markdown parsing.
- No support for uploading a whole vault/zip, Git sync, or an Obsidian
  plugin push flow — v1 is "publish one note," handled by picking a
  single `.md` file (+ its referenced attachments) and sending it to the
  backend. Don't build toward bulk import unless asked.
