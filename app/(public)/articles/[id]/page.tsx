import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id, published: true },
    include: { photos: true },
  });

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Date */}
        <p className="text-gray-400 text-sm mb-4">
          {new Date(article.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric", month: "long", year: "numeric"
          })}
        </p>

        {/* Title */}
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 leading-tight">
          {article.title}
        </h1>

        {/* Cover image — shown if available */}
        {article.coverImageUrl && (
          <div className="relative w-full h-72 mb-8 overflow-hidden rounded-xl">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article content with custom styles */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Additional photos */}
        {article.photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mt-10">
            {article.photos.map((p) => (
              <img key={p.id} src={p.url} alt=""
                className="rounded-xl w-full h-48 object-cover" />
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100">
          <a href="/articles" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour aux actualités
          </a>
        </div>
      </section>
    </main>
  );
}