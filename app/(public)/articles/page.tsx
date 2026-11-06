import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les actualités de la Mairie des Jeunes de Zè.",
};

export default async function ArticlesPublicPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Actualités</h1>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {articles.length === 0 ? (
          <p className="text-center text-gray-500">Aucune actualité pour le moment.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((a) => (
              <a
                key={a.id}
                href={`/articles/${a.id}`}
                className="block overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition hover:border-green-200 hover:shadow-md"
              >
                {/* Cover image on the card */}
                {a.coverImageUrl ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={a.coverImageUrl}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-green-50">
                    <span className="text-4xl text-green-200">📰</span>
                  </div>
                )}

                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                    Actualité
                  </p>
                  <h2 className="mb-3 font-serif text-lg leading-snug font-bold text-gray-900">
                    {a.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDate(a.createdAt, {
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
