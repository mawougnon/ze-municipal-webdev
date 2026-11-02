import { formatDate } from "@/lib/format";
import { cleanArticleHtml } from "@/lib/articles";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
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

        {/* Cover image: shown if available */}
        {article.coverImageUrl && (
          <div className="relative mb-8 h-72 w-full overflow-hidden rounded-xl">
            <Image
              src={article.coverImageUrl}
              alt={article.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              preload
            />
          </div>
        )}

        {/* Article content with custom styles */}
        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: cleanArticleHtml(article.content) }}
        />

        {/* Additional photos */}
        {article.photos.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-4">
            {article.photos.map((p) => (
              <div key={p.id} className="relative h-48 w-full overflow-hidden rounded-xl">
                <Image
                  src={p.url}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 384px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
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
