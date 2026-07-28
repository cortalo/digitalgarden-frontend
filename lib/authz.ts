import type { Session } from "next-auth"

// session.backendToken is a JWT digitalgarden-backend issued itself (see
// its internal/infra/authtoken package) — its only real claim is "sub",
// the numeric user ID. We only ever need to read that claim here, not
// verify the signature: the token already came from a successful login
// through our own auth.ts, so decoding (not verifying) it is enough to
// know which user this session belongs to.
function decodeUserId(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
    const id = Number(json.sub)
    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

// Used both to decide whether to show a note's refresh control, and
// inside the refresh Server Action itself to actually enforce it — the
// action is a real callable endpoint regardless of whether the button
// is rendered, so hiding the button alone isn't access control.
export function isNoteAuthor(session: Session | null, authorUserId: number): boolean {
  if (!session?.backendToken) return false
  return decodeUserId(session.backendToken) === authorUserId
}
