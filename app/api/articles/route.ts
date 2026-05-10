import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET /api/articles — fetch all articles
export async function GET() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: true },
  });
  return NextResponse.json(articles);
}

// POST /api/articles — create a new article
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content, coverImageUrl, published } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: { title, content, coverImageUrl, published: published || false },
  });

  revalidatePath("/articles");
  revalidatePath("/"); //
  return NextResponse.json(article, { status: 201 });
}