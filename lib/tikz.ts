import tex2svg from "node-tikzjax"

// node-tikzjax cannot run concurrent renders in the same process (a
// documented limitation — concurrent calls throw, confirmed by testing).
// This chains every call onto the previous one so requests are serialized
// process-wide, which a public feed with concurrent readers requires.
let queue: Promise<unknown> = Promise.resolve()

export function renderTikz(source: string): Promise<string> {
  const result = queue.then(() => tex2svg(source))
  queue = result.catch(() => {})
  return result
}
