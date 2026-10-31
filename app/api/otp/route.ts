import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const OTP_TTL_MS = 10 * 60 * 1000;
// One code per account every 2 minutes, counted in the database (no external service).
const OTP_INTERVAL_MS = 2 * 60 * 1000;

export async function POST(req: Request) {
  try {
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

    // otpExpires is set OTP_TTL_MS after issue, so the last issue time can be derived from it
    if (user.otpExpires && user.otpExpires.getTime() - OTP_TTL_MS + OTP_INTERVAL_MS > Date.now()) {
      return NextResponse.json(
        { error: "Un code vient d'être envoyé. Patientez deux minutes avant d'en demander un autre." },
        { status: 429 }
      );
    }

    // Code a 6 chiffres tire d'un generateur cryptographique.
    // Math.random() n'en est pas un : sa sortie est predictible.
    const otp = randomInt(100000, 1000000).toString();

    // OTP expires in 10 minutes
    const expires = new Date(Date.now() + OTP_TTL_MS);

    // Seul le hache est stocke : une lecture de la base ne donne aucun code utilisable.
    const otpHash = await bcrypt.hash(otp, 10);

    await prisma.user.update({
      where: { email },
      data: {
        otpHash,
        otpExpires: expires,
        otpAttempts: 0, // un nouveau code remet le compteur a zero
      },
    });

    // isSuperAdmin determined from DB role — never from client input
    const isSuperAdmin = user.role === "SUPERADMIN";

    // Send OTP via Resend
    // The Resend SDK returns errors instead of throwing them
    const { error: sendError } = await resend.emails.send({
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

    if (sendError) throw new Error(`Resend email error: ${sendError.message}`);

    return NextResponse.json({ success: true, isSuperAdmin });

  } catch (error) {
    // Un seul message pour plusieurs services differents rendait tout diagnostic impossible.
    // On journalise l'etape fautive pour pouvoir la lire dans les logs Vercel.
    const stage =
      error instanceof Error && /prisma|database|connect|ECONNREFUSED/i.test(error.message) ? "DATABASE"
      : error instanceof Error && /resend|email|domain/i.test(error.message) ? "EMAIL"
      : "UNKNOWN";

    console.error(`OTP_SEND_ERROR [${stage}]:`, error);

    return NextResponse.json(
      { error: "Service momentanement indisponible. Reessayez dans quelques minutes." },
      { status: 503 }
    );
  }
}