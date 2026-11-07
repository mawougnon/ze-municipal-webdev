import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { articleSchema } from "@/lib/articles";
import { logAdminAction, logSave } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBody } from "@/lib/request";
import { removePublicFile } from "@/lib/supabase-admin";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, articleSchema);
  if (invalid) return invalid;

  const { id } = await params;
  const { photos, ...fields } = data;
  const saved = await prisma
    .$transaction(async (tx) => {
      const previous = await tx.article.findUniqueOrThrow({
        where: { id },
        include: { photos: true },
      });
      const article = await tx.article.update({
        where: { id },
        data: {
          ...fields,
          photos: {
            deleteMany: {},
            create: photos.map((photo, position) => ({ ...photo, position })),
          },
        },
      });
      await logSave(tx, session, req, "ARTICLE", article);
      return { article, previous };
    })
    .catch(() => null);
  if (!saved) return errorResponse("Article introuvable.", 404);

  const kept = new Set([saved.article.coverImageUrl, ...photos.map((photo) => photo.url)]);
  const before = [saved.previous.coverImageUrl, ...saved.previous.photos.map((photo) => photo.url)];
  await Promise.all(
    before.filter((url) => !kept.has(url)).map((url) => removePublicFile("photos", url)),
  );

  return NextResponse.json(saved.article);
}

export async function DELETE(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { id } = await params;
  const deleted = await prisma
    .$transaction(async (tx) => {
      const article = await tx.article.delete({ where: { id }, include: { photos: true } });
      await logAdminAction(tx, session, req, "ARTICLE_DELETED", article.title);
      return article;
    })
    .catch(() => null);
  if (!deleted) return errorResponse("Article introuvable.", 404);

  const files = [deleted.coverImageUrl, ...deleted.photos.map((photo) => photo.url)];
  await Promise.all(files.map((url) => removePublicFile("photos", url)));

  return NextResponse.json({ success: true });
}
