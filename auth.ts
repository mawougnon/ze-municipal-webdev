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

        // PATH A: OTP login (all roles)
        if (otp) {
          if (!user.otpHash || !user.otpExpires) return null;

          // Expiration verifiee avant toute comparaison
          if (new Date() > user.otpExpires) return null;

          // Garde-fou en base : la force brute reste bornee a 5 essais par code emis.
          if (user.otpAttempts >= 5) {
            // otpExpires is kept: /api/otp derives the 2 minute resend delay from it
            await prisma.user.update({
              where: { email },
              data: { otpHash: null, otpAttempts: 0 },
            });
            await prisma.auditLog.create({
              data: { action: "LOGIN_OTP_LOCKED", userEmail: user.email },
            });
            return null;
          }

          // bcrypt.compare est a temps constant : la duree ne revele rien.
          // L'ancienne comparaison avec .every() s'arretait au premier caractere different.
          const isOtpValid = await bcrypt.compare(otp, user.otpHash);

          if (!isOtpValid) {
            await prisma.user.update({
              where: { email },
              data: { otpAttempts: { increment: 1 } },
            });
            await prisma.auditLog.create({
              data: { action: "LOGIN_OTP_FAILED", userEmail: user.email },
            });
            return null;
          }

          // Code invalide des qu'il a servi
          await prisma.user.update({
            where: { email },
            data: { otpHash: null, otpExpires: null, otpAttempts: 0 },
          });

          await prisma.auditLog.create({
            data: { action: "LOGIN_OTP_SUCCESS", userEmail: user.email },
          });

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        }

        // PATH B: Password login (SUPERADMIN only)
        if (password) {
          // Only SUPERADMIN can use password login
          if (user.role !== "SUPERADMIN") return null;
          if (!user.password) return null;

          // Failures are counted from the audit log: 5 in 15 minutes locks the password login.
          // The email code keeps working, so a locked password never locks the account out.
          const recentFailures = await prisma.auditLog.count({
            where: {
              userEmail: user.email,
              action: "LOGIN_PASSWORD_FAILED",
              createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
            },
          });
          if (recentFailures >= 5) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            await prisma.auditLog.create({
              data: { action: "LOGIN_PASSWORD_FAILED", userEmail: user.email },
            });
            return null;
          }

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
      if (user) {
        token.role = (user as any).role;
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
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
  },

});