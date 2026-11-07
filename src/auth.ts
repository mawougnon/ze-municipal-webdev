import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyLoginCode } from "@/lib/login";
import { clientIp } from "@/lib/request";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60,
    updateAge: 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        return token;
      }
      // Read the account on every request so that removals and role changes apply at once
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
