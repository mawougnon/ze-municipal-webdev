import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { articleSchema } from "@/lib/articles";
import { logAdminAction } from "@/lib/audit";

// POST /api/articles: create a new article
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = articleSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const article = await prisma.$transaction(async (tx) => {
    const { photos, ...fields } = result.data;
    const created = await tx.article.create({
      data: {
        ...fields,
        photos: { create: photos.map((url, position) => ({ url, position })) },
      },
    });
    const action = created.published ? "ARTICLE_SAVED_ONLINE" : "ARTICLE_SAVED_DRAFT";
    await logAdminAction(tx, session, req, action, created.title);
    return created;
  });

  revalidatePath("/articles");
  revalidatePath("/"); //
  return NextResponse.json(article, { status: 201 });
}
