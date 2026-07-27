import { RenderTree } from "@/app/components/render-tree"
import { getNote } from "@/lib/api"

// Step 1 validation: render a hardcoded tree (mocked in lib/api.ts,
// matching digitalgarden-backend's TestParse_HelloWorld output exactly)
// by walking it through RenderTree. Proves the tree shape is something
// a frontend can sanely consume before any real backend/auth/DB exists.
export default async function Home() {
  const tree = await getNote()

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <RenderTree node={tree} />
    </main>
  )
}
