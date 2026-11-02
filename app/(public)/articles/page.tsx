import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
          <p className="text-center text-gray-400">Aucune actualité pour le moment.</p>
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
                  <img src={a.coverImageUrl} alt={a.title} className="h-48 w-full object-cover" />
                ) : (
                  <div className="flex h-48 w-full items-center justify-center bg-green-50">
                    <span className="text-4xl text-green-200">📰</span>
                  </div>
                )}

                <div className="p-6">
                  <p className="mb-2 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                    Actualité
                  </p>
                  <h2 className="mb-3 font-serif text-lg leading-snug font-bold text-gray-900">
                    {a.title}
                  </h2>
                  <p className="text-sm text-gray-400">
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
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
