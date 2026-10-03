// wavedrom ships no type declarations. Only the server-side rendering
// entry points lib/wavedrom.ts uses are declared here; onml trees are
// left as unknown since nothing here inspects them.
declare module "wavedrom" {
  export function renderAny(
    index: number,
    source: unknown,
    waveSkin: unknown,
    notFirstSignal?: boolean,
  ): unknown[]
  export const waveSkin: unknown
  export const onml: { stringify(tree: unknown): string }
}
