import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { logAdminAction } from "@/lib/audit";
import { removeFiles } from "@/lib/application-files";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  // The identifier only: the name of a deleted applicant must not live on in the log
  const files = await prisma.$transaction(async (tx) => {
    const deleted = await tx.application.delete({ where: { id }, include: { files: true } });
    await logAdminAction(tx, session, req, "APPLICATION_DELETED", id);
    return deleted.files.map((f) => f.path);
  });

  // The application is gone either way; the daily purge retries a file that could not be removed
  await removeFiles(files).catch((error) => console.error("APPLICATION_FILE_ERROR:", error));

  return NextResponse.json({ success: true });
}
