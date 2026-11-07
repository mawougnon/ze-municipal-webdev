import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { roleSchema } from "@/lib/accounts";
import { superadminAccess } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBody } from "@/lib/request";
import { z } from "@/lib/zod";

interface Context {
  params: Promise<{ id: string }>;
}

// Nobody can demote or delete their own account, so a SUPERADMIN always remains
async function findOtherAccount(id: string, session: Session) {
  const account = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!account) return { refusal: errorResponse("Compte introuvable.", 404) };
  if (account.email === session.user.email) {
    return {
      refusal: errorResponse("Un autre administrateur principal doit modifier votre compte.", 400),
    };
  }
  return { account };
}

export async function PATCH(req: Request, { params }: Context) {
  const { session, denied } = await superadminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, z.object({ role: roleSchema }));
  if (invalid) return invalid;

  const { id } = await params;
  const { account, refusal } = await findOtherAccount(id, session);
  if (refusal) return refusal;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data: { role: data.role } });
    await logAdminAction(
      tx,
      session,
      req,
      "ACCOUNT_ROLE_CHANGED",
      `${account.email} (${data.role})`,
    );
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: Context) {
  const { session, denied } = await superadminAccess();
  if (denied) return denied;

  const { id } = await params;
  const { account, refusal } = await findOtherAccount(id, session);
  if (refusal) return refusal;

  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id } });
    await logAdminAction(tx, session, req, "ACCOUNT_DELETED", account.email);
  });

  return NextResponse.json({ success: true });
}
