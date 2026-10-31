import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// GET /api/articles: fetch all articles
export async function GET() {
  // Drafts are only returned to a logged-in admin
  const session = await auth();
  const articles = await prisma.article.findMany({
    where: session ? undefined : { published: true },
    orderBy: { createdAt: "desc" },
    include: { photos: true },
  });
  return NextResponse.json(articles);
}

// POST /api/articles: create a new article
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { title, content, coverImageUrl, published } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "Le titre et le contenu sont obligatoires." }, { status: 400 });
  }

  const article = await prisma.article.create({
    data: { title, content, coverImageUrl, published: published || false },
  });

  revalidatePath("/articles");
  revalidatePath("/"); //
  return NextResponse.json(article, { status: 201 });
}