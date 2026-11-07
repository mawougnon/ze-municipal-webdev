import { formatDate } from "@/lib/format";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArticlesPage() {
  await requireAdmin();

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
          <Link
            href="/admin/articles/nouveau"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Nouvel article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Aucun article pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{article.title}</h2>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm text-gray-500">{formatDate(article.createdAt)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        article.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/articles/${article.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Modifier
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-600">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
