import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Initialize Upstash Ratelimit
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    // 2. Extract IP and check rate limit immediately
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans 15 minutes." },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });

    // Constant-time delay to prevent email enumeration attacks
    if (!user) {
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ error: "Email non autorisé." }, { status: 403 });
    }

    // Generate cryptographically random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP in database
    await prisma.user.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpires: expires,
      },
    });

    // isSuperAdmin determined from DB role — never from client input
    const isSuperAdmin = user.role === "SUPERADMIN";

    // Send OTP via Resend
    await resend.emails.send({
      from: "Mairie de Zè <onboarding@resend.dev>",
      to: email,
      subject: "Code de vérification — Mairie des Jeunes de Zè",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #1a3a2a; margin: 0 0 8px;">Mairie des Jeunes de Zè</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 0 0 24px;">Espace Administration — Accès Restreint</p>
          <p style="margin: 0 0 16px; color: #111827;">Votre code de connexion :</p>
          <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #1a3a2a;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">
            Ce code expire dans <strong>10 minutes</strong>. Ne le partagez avec personne.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, isSuperAdmin });

  } catch (error) {
    console.error("OTP_SEND_ERROR:", error);
    return NextResponse.json({ error: "Échec de l'envoi du code." }, { status: 500 });
  }
}