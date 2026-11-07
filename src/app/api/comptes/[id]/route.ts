import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { roleSchema } from "@/lib/accounts";
import { superadminSession } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

// Nobody can demote or delete their own account. The person acting stays a principal
// administrator, so the site can never be left without one.
async function findOtherAccount(id: string, session: Session) {
  const account = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!account) {
    return { refusal: NextResponse.json({ error: "Compte introuvable." }, { status: 404 }) };
  }
  if (account.email === session.user.email) {
    return {
      refusal: NextResponse.json(
        { error: "Un autre administrateur principal doit modifier votre compte." },
        { status: 400 },
      ),
    };
  }
  return { account };
}

export async function PATCH(req: Request, { params }: Context) {
  const session = await superadminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const body = await req.json().catch(() => null);
  const role = roleSchema.safeParse(body?.role);
  if (!role.success)
    return NextResponse.json({ error: role.error.issues[0].message }, { status: 400 });

  const { id } = await params;
  const { account, refusal } = await findOtherAccount(id, session);
  if (refusal) return refusal;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { role: role.data } });
    await logAdminAction(
      tx,
      session,
      req,
      "ACCOUNT_ROLE_CHANGED",
      `${account.email} (${role.data})`,
    );
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await superadminSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

  const { id } = await params;
  const { account, refusal } = await findOtherAccount(id, session);
  if (refusal) return refusal;

  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id } });
    await logAdminAction(tx, session, req, "ACCOUNT_DELETED", account.email);
  });

  return NextResponse.json({ success: true });
}
