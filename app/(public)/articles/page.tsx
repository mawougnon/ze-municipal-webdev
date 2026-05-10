import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArticlesPublicPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Actualités</h1>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        {articles.length === 0 ? (
          <p className="text-gray-400 text-center">Aucune actualité pour le moment.</p>
        ) : (
          <div className="space-y-6">
            {articles.map((a) => (
              <a key={a.id} href={`/articles/${a.id}`}
                className="block bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-green-200 transition overflow-hidden">
                
                {/* Cover image on the card */}
                {a.coverImageUrl ? (
                  <img src={a.coverImageUrl} alt={a.title}
                    className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-green-50 flex items-center justify-center">
                    <span className="text-green-200 text-4xl">📰</span>
                  </div>
                )}

                <div className="p-6">
                  <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold mb-2">
                    Actualité
                  </p>
                  <h2 className="font-serif font-bold text-gray-900 text-lg mb-3 leading-snug">
                    {a.title}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Retour à l'accueil</Link>
        </div>
      </section>
    </main>
  );
}