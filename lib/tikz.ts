import { Worker } from "node:worker_threads"
import { unstable_cache } from "next/cache"
// Never called in this process — compilation happens in the worker
// below. The import is here only so Vercel's file tracing still sees
// node-tikzjax as a dependency of this module and ships it (plus its
// WASM/LaTeX assets) with the function; the worker's own require() of
// it is inside a code string, which tracing can't follow.
import "node-tikzjax"

export type TikzResult = { ok: true; svg: string } | { ok: false; reason: string }

// Some pictures make node-tikzjax take down the whole process rather
// than reject: a circuitikz `node[op amp]` needs the font cmmib5, which
// isn't bundled, and dvi2html throws "Could not find font" from outside
// tex2svg's promise chain — an uncaughtException that try/catch can't
// see (confirmed by testing). In-process, that killed the page being
// rendered and every other page compiling on the same instance. Running
// tex2svg in a worker thread contains it: an uncaught exception there
// only ends the worker, and arrives here as an "error" event.
//
// Inline (eval) worker code rather than a separate file: a worker file
// path wouldn't survive Turbopack's bundling, the same problem
// serverExternalPackages works around in next.config.ts. require()
// resolves from process.cwd(), where node_modules lives both locally
// and on Vercel.
const WORKER_CODE = `
const { parentPort } = require("node:worker_threads")
const mod = require("node-tikzjax")
const tex2svg = mod.default ?? mod
parentPort.on("message", async (source) => {
  try {
    parentPort.postMessage({ ok: true, svg: await tex2svg(source) })
  } catch (e) {
    parentPort.postMessage({ ok: false, reason: String((e && e.message) || e) })
  }
})
`

// Generous next to the 3.4s worst case seen in a real note, plus the
// worker's own startup (loading the TeX core dump, ~0.5s) — this only
// exists to stop one stuck picture from holding up the whole queue.
const TIMEOUT_MS = 20_000

// One long-lived worker, replaced whenever it dies or times out.
let worker: Worker | null = null

function compileInWorker(source: string): Promise<TikzResult> {
  if (!worker) {
    worker = new Worker(WORKER_CODE, { eval: true })
    // An idle worker shouldn't keep the server process alive on its own.
    worker.unref()
  }
  const w = worker

  return new Promise((resolve, reject) => {
    const discard = () => {
      if (worker === w) worker = null
    }
    const settle = () => {
      clearTimeout(timer)
      w.off("message", onMessage)
      w.off("error", onError)
      w.off("exit", onExit)
    }
    const onMessage = (result: TikzResult) => {
      settle()
      resolve(result)
    }
    const onError = (err: Error) => {
      settle()
      discard()
      resolve({ ok: false, reason: err.message })
    }
    const onExit = (code: number) => {
      settle()
      discard()
      resolve({ ok: false, reason: `TikZ worker exited with code ${code}` })
    }
    const timer = setTimeout(() => {
      settle()
      discard()
      void w.terminate()
      reject(new Error(`TikZ compile timed out after ${TIMEOUT_MS}ms`))
    }, TIMEOUT_MS)

    w.on("message", onMessage)
    w.on("error", onError)
    w.on("exit", onExit)
    w.postMessage(source)
  })
}

// node-tikzjax cannot run concurrent renders in the same process (a
// documented limitation — concurrent calls throw, confirmed by testing).
// This chains every call onto the previous one so requests are serialized
// process-wide, which a public feed with concurrent readers requires.
// The single worker above relies on this too: it handles one message at
// a time.
let queue: Promise<unknown> = Promise.resolve()

function renderTikzUncached(source: string): Promise<TikzResult> {
  // Only fires on an actual cache miss (unstable_cache short-circuits
  // before calling this on a hit) — check Runtime Logs for repeats of
  // the same source with no new deploy in between to confirm Data
  // Cache eviction as the cause of a slow page load.
  console.log(`[tikz] compiling (cache miss), source length=${source.length}`)
  const result = queue.then(() => compileInWorker(source))
  queue = result.catch(() => {})
  return result
}

// Compiling a TikZ picture to SVG is real LaTeX/PGF work, not a cheap
// string transform — confirmed directly that a pgfplots-style smooth
// curve (samples=100 inside a \foreach) alone took 3.4s, and this cost
// was being paid fresh on every single page render: getNote()'s cache
// only covers the note's raw data, not this derived compilation step.
// Cached here purely by content — source is part of what Next.js
// derives the cache key from — with no tags or expiry, since the same
// TikZ source always compiles to the same SVG: if a note's TikZ source
// ever changes, that's simply a different cache key, not something that
// needs explicit invalidation.
//
// Failures are cached too, for the same reason: a missing font or a TeX
// error fails identically every time, and recompiling it on each visit
// would cost a fresh worker per view. Timeouts are the exception — they
// reject instead of resolving, so unstable_cache doesn't store them and
// the next visit tries again. The "v2" key part keeps entries from
// before results became objects (plain SVG strings) from being read
// back as the new shape.
const renderTikzCached = unstable_cache(renderTikzUncached, ["render-tikz-v2"], {
  revalidate: false,
})

// Never rejects: one bad picture should degrade to a placeholder, not
// fail the rest of the page.
export async function renderTikz(source: string): Promise<TikzResult> {
  try {
    return await renderTikzCached(source)
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) }
  }
}
