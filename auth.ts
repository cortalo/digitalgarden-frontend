import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

declare module "next-auth" {
  interface Session {
    backendToken: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        const res = await fetch(`${process.env.API_URL}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: account.id_token }),
        })
        if (res.ok) {
          const data = await res.json()
          ;(token as Record<string, unknown>).backendToken = data.token
        }
      }
      return token
    },
    async session({ session, token }) {
      session.backendToken = ((token as Record<string, unknown>).backendToken as string) ?? ""
      return session
    },
  },
})
