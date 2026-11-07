import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { accountSchema } from "@/lib/accounts";
import { superadminAccess } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { session, refusal: denied } = await superadminAccess();
  if (denied) return denied;

  const result = accountSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { email, role } = result.data;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({ data: result.data });
      await logAdminAction(tx, session, req, "ACCOUNT_CREATED", `${email} (${role})`);
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Cette adresse a déjà un compte." }, { status: 409 });
    }
    throw e;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
