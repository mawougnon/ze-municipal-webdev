import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { logAdminAction, logSave } from "@/lib/audit";
import { documentSchema, releaseFeaturedPlace } from "@/lib/documents";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBody } from "@/lib/request";
import { removePublicFile } from "@/lib/supabase-admin";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, documentSchema);
  if (invalid) return invalid;

  const { id } = await params;
  const saved = await prisma
    .$transaction(async (tx) => {
      const previous = await tx.document.findUniqueOrThrow({ where: { id } });
      await releaseFeaturedPlace(tx, data);
      const document = await tx.document.update({ where: { id }, data });
      await logSave(tx, session, req, "DOCUMENT", document);
      return { document, previous };
    })
    .catch(() => null);
  if (!saved) return errorResponse("Document introuvable.", 404);

  if (saved.previous.fileUrl !== saved.document.fileUrl) {
    await removePublicFile("documents", saved.previous.fileUrl);
  }
  return NextResponse.json(saved.document);
}

export async function DELETE(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { id } = await params;
  const deleted = await prisma
    .$transaction(async (tx) => {
      const document = await tx.document.delete({ where: { id } });
      await logAdminAction(tx, session, req, "DOCUMENT_DELETED", document.title);
      return document;
    })
    .catch(() => null);
  if (!deleted) return errorResponse("Document introuvable.", 404);

  await removePublicFile("documents", deleted.fileUrl);
  return NextResponse.json({ success: true });
}
