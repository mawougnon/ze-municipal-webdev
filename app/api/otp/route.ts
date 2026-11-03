import { after, NextResponse } from "next/server";
import { z } from "zod";
import { requestLoginCode } from "@/lib/login";
import { clientIp } from "@/lib/request";

const bodySchema = z.object({ email: z.email() });

// The same answer whether or not the address has an account
const ANSWER = {
  message: "Si cette adresse correspond à un compte, un code vient d’y être envoyé.",
};

export async function POST(req: Request) {
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const ip = clientIp(req.headers);

  // The work runs after the response is sent, so the response time cannot reveal
  // whether the account exists either. Failures are logged for the Vercel logs.
  after(async () => {
    try {
      await requestLoginCode(body.data.email, ip);
    } catch (error) {
      const stage =
        error instanceof Error && /prisma|database|connect|ECONNREFUSED/i.test(error.message)
          ? "DATABASE"
          : error instanceof Error && /resend|email|domain/i.test(error.message)
            ? "EMAIL"
            : "UNKNOWN";
      console.error(`OTP_SEND_ERROR [${stage}]:`, error);
    }
  });

  return NextResponse.json(ANSWER);
}
