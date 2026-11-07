import "server-only";
import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_INTERVAL_MS = 2 * 60 * 1000;
export const MAX_ATTEMPTS = 5;

const resend = new Resend(process.env.RESEND_API_KEY);

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function requestLoginCode(rawEmail: string, ip: string | null) {
  const email = normalizeEmail(rawEmail);
  const code = randomInt(100000, 1000000).toString();
  const now = Date.now();

  // Atomic. Updates nothing without an account, or within CODE_INTERVAL_MS of the last code.
  const issued = await prisma.user.updateMany({
    where: {
      email,
      OR: [
        { otpExpires: null },
        { otpExpires: { lt: new Date(now + CODE_TTL_MS - CODE_INTERVAL_MS) } },
      ],
    },
    data: {
      otpHash: await bcrypt.hash(code, 10),
      otpExpires: new Date(now + CODE_TTL_MS),
      otpAttempts: 0,
    },
  });
  if (issued.count === 0) return;

  const { error } = await resend.emails.send({
    from: "Mairie de Zè <onboarding@resend.dev>",
    to: email,
    subject: "Mairie des Jeunes de Zè : votre code de vérification",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1a3a2a; margin: 0 0 8px;">Mairie des Jeunes de Zè</h2>
        <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">Espace Administration · Accès restreint</p>
        <p style="margin: 0 0 16px; color: #111827;">Votre code de connexion :</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #1a3a2a;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #9ca3af; margin: 0;">
          Ce code expire dans <strong>10 minutes</strong>. Ne le partagez avec personne.
        </p>
      </div>
    `,
  });
  if (error) throw new Error(`Resend email error: ${error.message}`);

  await prisma.auditLog.create({
    data: { action: "LOGIN_OTP_SENT", userEmail: email, ipAddress: ip },
  });
}

export async function verifyLoginCode(rawEmail: string, code: string, ip: string | null) {
  const email = normalizeEmail(rawEmail);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.otpHash || !user.otpExpires || user.otpExpires.getTime() < Date.now()) return null;

  const log = (action: string) =>
    prisma.auditLog.create({ data: { action, userEmail: email, ipAddress: ip } });

  // Atomic, so parallel guesses cannot get past the limit
  const reserved = await prisma.user.updateMany({
    where: { email, otpAttempts: { lt: MAX_ATTEMPTS } },
    data: { otpAttempts: { increment: 1 } },
  });
  if (reserved.count === 0) {
    // otpExpires stays: the resend delay is derived from it
    await prisma.user.update({ where: { email }, data: { otpHash: null } });
    await log("LOGIN_OTP_LOCKED");
    return null;
  }

  if (!(await bcrypt.compare(code, user.otpHash))) {
    await log("LOGIN_OTP_FAILED");
    return null;
  }

  await prisma.user.update({
    where: { email },
    data: { otpHash: null, otpExpires: null, otpAttempts: 0 },
  });
  await log("LOGIN_OTP_SUCCESS");
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}
