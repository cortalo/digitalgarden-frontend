import katex from "katex"
import { TreeNode } from "@/lib/tree"
import { renderTikz } from "@/lib/tikz"
import { highlightCode } from "@/lib/highlight"

// Walks a TreeNode produced by the backend's markdown parser and
// dispatches on node.type — this file should never need to know
// anything about markdown syntax itself, only about the tree shape.
// See CLAUDE.md: "What the backend API gives you."
export async function RenderTree({ node }: { node: TreeNode }) {
  const children = node.children?.map((child, i) => (
    <RenderTree key={i} node={child} />
  ))

  switch (node.type) {
    case "root":
      return <div className="prose">{children}</div>
    case "heading": {
      const Tag = `h${node.depth ?? 1}` as keyof React.JSX.IntrinsicElements
      return <Tag>{children}</Tag>
    }
    case "paragraph":
      return <p>{children}</p>
    case "textBlock":
      // Renders without its own container — see the backend's
      // tree.go comment on ast.KindTextBlock for why this exists as
      // its own type instead of being folded into "paragraph".
      return <>{children}</>
    case "list": {
      const ListTag = node.ordered ? "ol" : "ul"
      return <ListTag>{children}</ListTag>
    }
    case "listItem":
      return <li>{children}</li>
    case "text":
      return <>{node.text}</>
    case "inlineMath":
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(node.text ?? "", {
              displayMode: false,
              throwOnError: false,
            }),
          }}
        />
      )
    case "mathBlock":
      return (
        <div
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(node.text ?? "", {
              displayMode: true,
              throwOnError: false,
            }),
          }}
        />
      )
    case "codeBlock": {
      const html = await highlightCode(node.text ?? "", node.lang)
      return <div dangerouslySetInnerHTML={{ __html: html }} />
    }
    case "tikzBlock": {
      // Plugin node, same tier as Excalidraw will be: Go only extracts the
      // raw TikZ source and tags the type (see CLAUDE.md's "Node
      // rendering" section), compiling it to SVG is a frontend job.
      const svg = await renderTikz(node.text ?? "")
      return <div dangerouslySetInnerHTML={{ __html: svg }} />
    }
    default:
      // An unrecognized node type should be visible, not silently
      // dropped — same reasoning as the backend's "unknown" fallback.
      return (
        <span className="text-red-500">
          [unsupported node: {node.type}]
        </span>
      )
  }
}
