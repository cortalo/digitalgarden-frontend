import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PublishClient } from "./PublishClient"

export default async function PublishPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return <PublishClient token={session.backendToken} />
}
