import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { removeFiles } from "@/lib/application-files";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/request";

interface Context {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { id } = await params;

  // The id only: the applicant's name must not stay in the log
  const files = await prisma
    .$transaction(async (tx) => {
      const deleted = await tx.application.delete({ where: { id }, include: { files: true } });
      await logAdminAction(tx, session, req, "APPLICATION_DELETED", id);
      return deleted.files.map((file) => file.path);
    })
    .catch(() => null);
  if (!files) return errorResponse("Candidature introuvable.", 404);

  // The daily purge retries a file that could not be removed
  await removeFiles(files).catch((error) => console.error("APPLICATION_FILE_ERROR", error));

  return NextResponse.json({ success: true });
}
