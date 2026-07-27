import { TreeNode } from "./tree"

// Phase 1 — in-memory mock (see CLAUDE.md's Data Access Rule). This
// tree is hand-copied from digitalgarden-backend's
// TestParse_HelloWorld output, to validate render-tree.tsx against the
// exact shape the real parser produces, without a live backend yet.
const helloWorldTree: TreeNode = {
  type: "root",
  children: [
    {
      type: "heading",
      depth: 1,
      children: [{ type: "text", text: "Hello World" }],
    },
    {
      type: "paragraph",
      children: [{ type: "text", text: "This is a paragraph." }],
    },
    {
      type: "list",
      ordered: false,
      children: [
        {
          type: "listItem",
          children: [
            {
              type: "textBlock",
              children: [{ type: "text", text: "First item" }],
            },
          ],
        },
        {
          type: "listItem",
          children: [
            {
              type: "textBlock",
              children: [{ type: "text", text: "Second item" }],
            },
          ],
        },
      ],
    },
  ],
}

export async function getNote(): Promise<TreeNode> {
  return helloWorldTree
}
