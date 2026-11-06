import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OpportunitesPage() {
  await requireAdmin();

  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Offres d’emploi & formations</h1>
          <Link
            href="/admin/opportunites/nouveau"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Nouvelle offre
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Aucune offre pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{o.title}</h2>
                  <div className="mt-1 flex gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${o.type === "JOB" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                    >
                      {o.type === "JOB" ? "Emploi" : "Formation"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${o.isFree ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {o.isFree ? "Gratuit" : `${o.price} XOF`}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${o.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {o.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/opportunites/${o.id}`}
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
