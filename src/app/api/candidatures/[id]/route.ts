import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeFiles } from "@/lib/application-files";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  // The id only: the applicant's name must not stay in the log
  const files = await prisma
    .$transaction(async (tx) => {
      const deleted = await tx.application.delete({ where: { id }, include: { files: true } });
      await logAdminAction(tx, session, req, "APPLICATION_DELETED", id);
      return deleted.files.map((file) => file.path);
    })
    .catch(() => null);
  if (!files) return NextResponse.json({ error: "Candidature introuvable." }, { status: 404 });

  // The daily purge retries a file that could not be removed
  await removeFiles(files).catch((error) => console.error("APPLICATION_FILE_ERROR", error));

  return NextResponse.json({ success: true });
}
