// Mirrors internal/markdown.Node in digitalgarden-backend exactly — this
// is the JSON shape the backend's Parse() produces. Keep these two
// definitions in sync by hand for now; there's no shared schema yet.
export interface TreeNode {
  type: string
  depth?: number
  text?: string
  ordered?: boolean
  children?: TreeNode[]
}
