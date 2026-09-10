import { ListTodo, Info, LucideIcon } from "lucide-react"

// Obsidian callout kinds the backend can emit. The kind arrives inside
// the node's type name ("callout-todo") rather than in a field of its
// own — see the backend's parseCallout for why — and it is never
// validated there, because Obsidian accepts arbitrary kinds and styles
// unrecognized ones like a plain note. So this map is a lookup with a
// fallback, not an exhaustive list: a kind missing from it still renders
// as a callout rather than as an error.
const KINDS: Record<string, { icon: LucideIcon; box: string; label: string }> = {
  todo: {
    icon: ListTodo,
    box: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    label: "text-blue-700 dark:text-blue-300",
  },
}

const FALLBACK = {
  icon: Info,
  box: "border-zinc-400 bg-zinc-50 dark:bg-zinc-900/50",
  label: "text-zinc-700 dark:text-zinc-300",
}

// A callout's own title is dropped by the backend (it carries nothing
// worth rendering — it's literally "Task" in every real note), so the
// header text is derived from the kind here. That mapping is a display
// concern and deliberately lives on this side, next to the icon and
// color it belongs with.
export function Callout({
  kind,
  text,
  children,
}: {
  kind: string
  text?: string
  children?: React.ReactNode
}) {
  const style = KINDS[kind] ?? FALLBACK
  const Icon = style.icon

  return (
    <div className={`my-6 rounded-md border-l-4 px-4 py-3 ${style.box}`}>
      <div className={`flex items-center gap-2 font-semibold ${style.label}`}>
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="capitalize">{kind}</span>
      </div>
      {/* The body arrives as plain text, not as child nodes, so the line
          breaks the author wrote are the only structure it has — without
          whitespace-pre-wrap a multi-line callout collapses into one run-
          on line. */}
      {text && <p className="mt-1 mb-0 whitespace-pre-wrap">{text}</p>}
      {children}
    </div>
  )
}
