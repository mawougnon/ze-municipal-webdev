import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OpportunitesPage() {
  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Offres d'emploi & formations</h1>
          <Link href="/admin/opportunites/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Nouvelle offre
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">Aucune offre pour le moment.</div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((o) => (
              <div key={o.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{o.title}</h2>
                  <div className="flex gap-3 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.type === "JOB" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {o.type === "JOB" ? "Emploi" : "Formation"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.isFree ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {o.isFree ? "Gratuit" : `${o.price} XOF`}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {o.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/opportunites/${o.id}`} className="text-blue-600 hover:underline text-sm">Modifier</Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour au tableau de bord</Link>
        </div>
      </div>
    </main>
  );
}