import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { openOffersWhere } from "@/lib/offers";

// The list depends on the current date, so it cannot stay frozen until the next edit
export const revalidate = 60;

export default async function OpportunitesPublicPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: openOffersWhere(),
    orderBy: { createdAt: "desc" },
  });

  const jobs = opportunities.filter((o) => o.type === "JOB");
  const trainings = opportunities.filter((o) => o.type === "TRAINING");

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Offres d'emploi & Formations</h1>
        <p className="mt-2 text-green-100">Opportunités disponibles pour la jeunesse de Zè</p>
      </section>

      <section className="mx-auto max-w-4xl space-y-12 px-6 py-12">
        {/* Jobs */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-gray-800">Offres d'emploi</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-400">Aucune offre d'emploi disponible.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((o) => (
                <Link
                  key={o.id}
                  href={`/opportunites/${o.id}`}
                  className="block rounded-xl border border-gray-100 bg-gray-50 p-6 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{o.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{o.description}</p>
                      {o.deadline && (
                        <p className="mt-2 text-xs text-gray-400">
                          Date limite : {formatDate(o.deadline)}
                        </p>
                      )}
                    </div>
                    <span className="ml-4 shrink-0 text-sm font-semibold text-green-700">
                      {o.isFree ? "Gratuit" : `${formatPrice(o.price)} XOF`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trainings */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-gray-800">Formations</h2>
          {trainings.length === 0 ? (
            <p className="text-gray-400">Aucune formation disponible.</p>
          ) : (
            <div className="space-y-4">
              {trainings.map((o) => (
                <Link
                  key={o.id}
                  href={`/opportunites/${o.id}`}
                  className="block rounded-xl border border-gray-100 bg-gray-50 p-6 transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{o.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">{o.description}</p>
                      {o.deadline && (
                        <p className="mt-2 text-xs text-gray-400">
                          Date limite : {formatDate(o.deadline)}
                        </p>
                      )}
                    </div>
                    <span className="ml-4 shrink-0 text-sm font-semibold text-green-700">
                      {o.isFree ? "Gratuit" : `${formatPrice(o.price)} XOF`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/" className="inline-block text-sm text-gray-400 hover:text-gray-600">
          ← Retour à l'accueil
        </Link>
      </section>
    </main>
  );
}
