import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OpportunitesPublicPage() {
  const now = new Date();

  const opportunities = await prisma.opportunity.findMany({
    where: { 
      published: true, // L'admin doit avoir coché "Publier"
      OR: [
        { deadline: null },      // Affiche si aucune date n'est définie
        { deadline: { gte: now } } // Affiche si la date est aujourd'hui ou dans le futur
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  const jobs = opportunities.filter(o => o.type === "JOB");
  const trainings = opportunities.filter(o => o.type === "TRAINING");

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Offres d'emploi & Formations</h1>
        <p className="text-green-100 mt-2">Opportunités disponibles pour la jeunesse de Zè</p>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* Jobs */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Offres d'emploi</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-400">Aucune offre d'emploi disponible.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((o) => (
                <Link key={o.id} href={`/opportunites/${o.id}`}
                  className="block bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{o.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{o.description}</p>
                      {o.deadline && (
                        <p className="text-gray-400 text-xs mt-2">
                          Date limite : {new Date(o.deadline).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-green-700 ml-4 shrink-0">
                      {o.isFree ? "Gratuit" : `${o.price} XOF`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trainings */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-6">Formations</h2>
          {trainings.length === 0 ? (
            <p className="text-gray-400">Aucune formation disponible.</p>
          ) : (
            <div className="space-y-4">
              {trainings.map((o) => (
                <Link key={o.id} href={`/opportunites/${o.id}`}
                  className="block bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{o.title}</h3>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{o.description}</p>
                      {o.deadline && (
                        <p className="text-gray-400 text-xs mt-2">
                          Date limite : {new Date(o.deadline).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-green-700 ml-4 shrink-0">
                      {o.isFree ? "Gratuit" : `${o.price} XOF`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm inline-block">← Retour à l'accueil</Link>
      </section>
    </main>
  );
}