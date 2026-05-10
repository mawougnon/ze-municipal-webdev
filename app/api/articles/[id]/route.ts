import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PUT /api/articles/:id
 * Update an existing article
 */
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { title, content, published, coverImageUrl } = await req.json();

    const article = await prisma.article.update({
      where: { id },
      data: { title, content, published, coverImageUrl },
    });

    revalidatePath("/articles");
    revalidatePath(`/articles/${id}`);
    revalidatePath("/"); 

    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update article" }, { status: 500 });
  }
}

/**
 * DELETE /api/articles/:id
 * Remove an article from the database
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    await prisma.article.delete({
      where: { id },
    });

    revalidatePath("/articles");
    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Article deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Article not found or already deleted" }, { status: 404 });
  }
}