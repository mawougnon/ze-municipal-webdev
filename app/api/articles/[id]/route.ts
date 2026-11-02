import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { articleSchema } from "@/lib/articles";

/**
 * GET /api/articles/:id
 * Fetch a single article by ID
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: { photos: true },
    });

    // A draft is reported as missing unless an admin is logged in
    if (!article || (!article.published && !(await auth()))) {
      return NextResponse.json({ error: "Article introuvable." }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

/**
 * PUT /api/articles/:id
 * Update an existing article
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const result = articleSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  try {
    const { id } = await params;
    const article = await prisma.article.update({ where: { id }, data: result.data });

    revalidatePath("/articles");
    revalidatePath(`/articles/${id}`);
    revalidatePath("/");

    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "Échec de la mise à jour de l'article." }, { status: 500 });
  }
}

/**
 * DELETE /api/articles/:id
 * Remove an article from the database
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.article.delete({
      where: { id },
    });

    revalidatePath("/articles");
    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch {
    return NextResponse.json({ error: "Article introuvable ou déjà supprimé." }, { status: 404 });
  }
}
