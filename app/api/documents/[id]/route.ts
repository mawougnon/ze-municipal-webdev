import { auth } from "@/auth";
import { logAdminAction } from "@/lib/audit";
import { documentSchema } from "@/lib/documents";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = documentSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { id } = await params;
  const { data } = result;
  try {
    const document = await prisma.$transaction(async (tx) => {
      if (data.featured && data.published) {
        await tx.document.updateMany({ where: { featured: true }, data: { featured: false } });
      }
      const updated = await tx.document.update({ where: { id }, data });
      const action = updated.published ? "DOCUMENT_SAVED_ONLINE" : "DOCUMENT_SAVED_DRAFT";
      await logAdminAction(tx, session, req, action, updated.title);
      return updated;
    });
    return NextResponse.json(document);
  } catch {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.document.delete({ where: { id } });
      await logAdminAction(tx, session, req, "DOCUMENT_DELETED", deleted.title);
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }
}
