import { codeToHtml } from "shiki"

const themes = { light: "github-light", dark: "github-dark" }

// Renders a code block to syntax-highlighted HTML (dual light/dark theme,
// switched via CSS variables — see globals.css). Falls back to plain text
// if the note's language tag isn't one Shiki recognizes, rather than
// failing the whole page render over an unknown ```lang fence.
export async function highlightCode(
  code: string,
  lang: string | undefined
): Promise<string> {
  try {
    return await codeToHtml(code, { lang: lang || "text", themes, defaultColor: false })
  } catch {
    return await codeToHtml(code, { lang: "text", themes, defaultColor: false })
  }
}
