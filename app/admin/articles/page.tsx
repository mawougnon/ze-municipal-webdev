import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Fetch articles directly on the server — no useEffect needed
export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Articles</h1>
          <Link
            href="/admin/articles/nouveau"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Nouvel article
          </Link>
        </div>

        {/* Articles list */}
        {articles.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            Aucun article pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{article.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-gray-400 text-sm">
                      {new Date(article.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                    {/* Publication status badge */}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      article.published
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/articles/${article.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Modifier
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Back to dashboard */}
        <div className="mt-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>

      </div>
    </main>
  );
}