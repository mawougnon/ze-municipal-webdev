import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PtaPublicPage() {
  // Fetch activities and the official document
  const activities = await prisma.ptaActivity.findMany({ orderBy: { updatedAt: "desc" } });
  const ptaDoc = await prisma.ptaDocument.findFirst({ orderBy: { updatedAt: "desc" } });

  const total = activities.length;
  const completed = activities.filter((a) => a.status === "COMPLETED").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Header with official PTA document download button */}
      <section className="bg-green-700 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Plan de Travail Annuel</h1>
        <p className="mt-2 text-green-300">
          Mandature 2025-2030 · Suivi en temps réel des activités
        </p>

        {ptaDoc && (
          <a
            href={ptaDoc.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#D4AF37] px-6 py-3 text-sm font-semibold tracking-wide text-black uppercase transition hover:bg-[#b8962e]"
          >
            📄 Télécharger la version officielle du PTA {ptaDoc.year}
          </a>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {/* Barre de progression globale */}
        <div className="mb-10 rounded-xl border border-gray-100 bg-gray-50 p-6">
          <div className="mb-2 flex justify-between">
            <span className="font-semibold text-gray-700">Progression globale</span>
            <span className="font-bold text-green-700">{progressPercent}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-green-600 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-400">
            {completed} activités achevées sur {total}
          </p>
        </div>

        {/* Liste des activités */}
        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{a.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{a.description}</p>
                  <p className="mt-2 text-xs text-gray-400">Année {a.year}</p>
                </div>
                <span
                  className={`ml-4 shrink-0 rounded-full px-3 py-1 text-xs ${
                    a.status === "COMPLETED"
                      ? "bg-green-100 text-green-700"
                      : a.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {a.status === "COMPLETED"
                    ? "Terminé"
                    : a.status === "CANCELLED"
                      ? "Annulé"
                      : "En cours"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour à l’accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
