import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  // The identifier only: the name of a deleted applicant must not live on in the log
  await prisma.$transaction(async (tx) => {
    await tx.application.delete({ where: { id } });
    await logAdminAction(tx, session, req, "APPLICATION_DELETED", id);
  });

  return NextResponse.json({ success: true });
}
