import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Mairie de Zè",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        otp:      { label: "OTP",      type: "text"     },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined;
        const otp      = credentials?.otp      as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // ── PATH A: OTP login (all roles) ────────────────────────────
        if (otp) {
          if (!user.otpCode || !user.otpExpires) return null;

          // Check expiry before comparing
          if (new Date() > user.otpExpires) return null;

          // Constant-time comparison to prevent timing attacks
          const isOtpValid =
            otp.length === user.otpCode.length &&
            otp.split("").every((c, i) => c === user.otpCode![i]);

          if (!isOtpValid) return null;

          // Invalidate OTP immediately after use
          await prisma.user.update({
            where: { email },
            data: { otpCode: null, otpExpires: null },
          });

          await prisma.auditLog.create({
            data: { action: "LOGIN_OTP_SUCCESS", userEmail: user.email },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        // ── PATH B: Password login (SUPERADMIN only) ─────────────────
        if (password) {
          // Only SUPERADMIN can use password login
          if (user.role !== "SUPERADMIN") return null;
          if (!user.password) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          await prisma.auditLog.create({
            data: { action: "LOGIN_PASSWORD_SUCCESS", userEmail: user.email },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        return null;
      },
    }),
  ],

  // Session expires after 10 hours of inactivity
  session: {
    strategy: "jwt",
    maxAge: 10 * 60 * 60, // 10 hours in seconds
    updateAge: 60 * 60,   // refresh token every hour to track activity
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },

});