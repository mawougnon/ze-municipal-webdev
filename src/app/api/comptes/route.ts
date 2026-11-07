import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { accountSchema } from "@/lib/accounts";
import { superadminAccess } from "@/lib/admin";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBody } from "@/lib/request";

export async function POST(req: Request) {
  const { session, denied } = await superadminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, accountSchema);
  if (invalid) return invalid;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.create({ data });
      await logAdminAction(tx, session, req, "ACCOUNT_CREATED", `${data.email} (${data.role})`);
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("Cette adresse a déjà un compte.", 409);
    }
    throw error;
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
