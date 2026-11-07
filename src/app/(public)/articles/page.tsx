import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FaNewspaper } from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import { focusPosition } from "@/lib/focus";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités de la Mairie des Jeunes de Zè.",
};

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      <PageHeader title="Actualités" />

      <section className="mx-auto max-w-4xl px-6 py-12">
        {articles.length === 0 ? (
          <p className="text-center text-gray-500">Aucune actualité pour le moment.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/articles/${article.id}`}
                className="block overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:border-green-200 hover:shadow-md"
              >
                {article.coverImageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={article.coverImageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      style={{
                        objectPosition: focusPosition(article.coverFocusX, article.coverFocusY),
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-green-50">
                    <FaNewspaper aria-hidden className="text-4xl text-green-200" />
                  </div>
                )}

                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold tracking-widest text-gold-dark uppercase">
                    Actualité
                  </p>
                  <h2 className="mb-3 font-serif text-lg leading-snug font-bold text-gray-900">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(article.createdAt, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-600">
            ← Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
