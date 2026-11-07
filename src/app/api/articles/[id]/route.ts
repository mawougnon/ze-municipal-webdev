import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { articleSchema } from "@/lib/articles";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { removePublicFile } from "@/lib/supabase-admin";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Context) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const result = articleSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  try {
    const { id } = await params;
    const { article, previous } = await prisma.$transaction(async (tx) => {
      const previous = await tx.article.findUniqueOrThrow({
        where: { id },
        include: { photos: true },
      });
      const { photos, ...fields } = result.data;
      const updated = await tx.article.update({
        where: { id },
        data: {
          ...fields,
          photos: {
            deleteMany: {},
            create: photos.map((url, position) => ({ url, position })),
          },
        },
      });
      const action = updated.published ? "ARTICLE_SAVED_ONLINE" : "ARTICLE_SAVED_DRAFT";
      await logAdminAction(tx, session, req, action, updated.title);
      return { article: updated, previous };
    });
    const kept = new Set([article.coverImageUrl, ...result.data.photos]);
    const before = [previous.coverImageUrl, ...previous.photos.map((photo) => photo.url)];
    await Promise.all(
      before.filter((url) => !kept.has(url)).map((url) => removePublicFile("photos", url)),
    );

    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "Article introuvable." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await params;

    const deleted = await prisma.$transaction(async (tx) => {
      const article = await tx.article.delete({ where: { id }, include: { photos: true } });
      await logAdminAction(tx, session, req, "ARTICLE_DELETED", article.title);
      return article;
    });
    const files = [deleted.coverImageUrl, ...deleted.photos.map((photo) => photo.url)];
    await Promise.all(files.map((url) => removePublicFile("photos", url)));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
  }
}
