import { notFound } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { photos: { orderBy: { position: "asc" } } },
  });
  if (!article) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier l’article</h1>
        <ArticleForm
          id={id}
          initial={{
            title: article.title,
            content: article.content,
            coverImageUrl: article.coverImageUrl ?? "",
            photos: article.photos.map((p) => p.url),
            published: article.published,
          }}
        />
      </div>
    </main>
  );
}
