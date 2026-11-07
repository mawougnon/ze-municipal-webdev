import { after, NextResponse } from "next/server";
import { z } from "zod";
import { requestLoginCode } from "@/lib/login";
import { clientIp } from "@/lib/request";

const bodySchema = z.object({ email: z.email() });

const ANSWER = {
  message: "Si cette adresse correspond à un compte, un code vient d’y être envoyé.",
};

export async function POST(req: Request) {
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  const ip = clientIp(req.headers);

  // After the response, so its timing does not reveal whether the account exists
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
      console.error("OTP_SEND_ERROR", stage, error);
    }
  });

  return NextResponse.json(ANSWER);
}
