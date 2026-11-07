import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyLoginCode } from "@/lib/login";
import { clientIp } from "@/lib/request";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // One way in: a code sent by email. There is no password, so none can be stolen or guessed.
    Credentials({
      name: "Mairie de Zè",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "Code", type: "text" },
      },
      async authorize(credentials, request) {
        const { email, otp } = credentials ?? {};
        if (typeof email !== "string" || typeof otp !== "string") return null;
        return verifyLoginCode(email, otp, clientIp(request.headers));
      },
    }),
  ],

  // Session expires after 10 hours of inactivity
  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60, // 10 hours in seconds
    updateAge: 60 * 60, // refresh token every hour to track activity
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        return token;
      }
      // Read the account again on every request: a removed admin loses access at once
      // instead of keeping a valid token for up to 10 hours, and a role change applies.
      const current = token.email
        ? await prisma.user.findUnique({ where: { email: token.email }, select: { role: true } })
        : null;
      if (!current) return null;
      token.role = current.role;
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});
