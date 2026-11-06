import { formatDate } from "@/lib/format";
import { cleanArticleHtml } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import ArticleGallery from "@/components/ArticleGallery";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id, published: true },
    include: { photos: { orderBy: { position: "asc" } } },
  });

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        {/* Date */}
        <p className="mb-4 text-sm text-gray-400">
          {formatDate(article.createdAt, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Title */}
        <h1 className="mb-6 font-serif text-3xl leading-tight font-bold text-gray-900">
          {article.title}
        </h1>

        {/* Cover image: shown whole, whatever its shape */}
        {article.coverImageUrl && (
          <div className="relative mb-8 aspect-[3/2] w-full overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
              preload
            />
          </div>
        )}

        {/* Article content with custom styles */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: cleanArticleHtml(article.content) }}
        />

        {article.photos.length > 0 && (
          <ArticleGallery photos={article.photos.map((p) => p.url)} title={article.title} />
        )}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link href="/articles" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour aux actualités
          </Link>
        </div>
      </section>
    </main>
  );
}
