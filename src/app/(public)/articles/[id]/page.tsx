import { formatDate } from "@/lib/format";
import { cleanArticleHtml } from "@/lib/articles";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";
import ArticleGallery from "@/components/ArticleGallery";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

type Props = { params: Promise<{ id: string }> };

const getArticle = cache((id: string) =>
  prisma.article.findUnique({
    where: { id, published: true },
    include: { photos: { orderBy: { position: "asc" } } },
  }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle((await params).id);
  if (!article) return {};
  const description = sanitizeHtml(article.content, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .slice(0, 160);
  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      ...(article.coverImageUrl ? { images: [article.coverImageUrl] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle((await params).id);

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
        <p className="mb-4 text-sm text-gray-500">
          {formatDate(article.createdAt, {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h1 className="mb-6 font-serif text-3xl leading-tight font-bold text-gray-900">
          {article.title}
        </h1>

        {article.coverImageUrl && (
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 768px"
            className="mx-auto mb-8 h-auto max-h-[85vh] w-auto max-w-full rounded-xl"
            preload
          />
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: cleanArticleHtml(article.content) }}
        />

        {article.photos.length > 0 && (
          <ArticleGallery photos={article.photos.map((p) => p.url)} title={article.title} />
        )}

        <div className="mt-10 border-t border-gray-100 pt-6">
          <Link href="/articles" className="text-sm text-gray-500 hover:text-gray-600">
            ← Retour aux actualités
          </Link>
        </div>
      </section>
    </main>
  );
}
