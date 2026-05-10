import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function PtaPublicPage() {
  // Fetch activities and the official document
  const activities = await prisma.ptaActivity.findMany({ orderBy: { updatedAt: "desc" } });
  const ptaDoc = await prisma.ptaDocument.findFirst({ orderBy: { updatedAt: "desc" } });

  const total = activities.length;
  const completed = activities.filter(a => a.status === "COMPLETED").length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <main className="min-h-screen bg-white">
      {/* Header with official PTA document download button */}
      <section className="bg-green-700 text-white py-12 px-6 text-center">
        <h1 className="text-3xl font-bold">Plan de Travail Annuel</h1>
        <p className="text-green-300 mt-2">Mandature 2025–2030 · Suivi en temps réel des activités</p>
        
        {ptaDoc && (
          <a href={ptaDoc.pdfUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#D4AF37] text-black px-6 py-3 font-semibold hover:bg-[#b8962e] transition text-sm uppercase tracking-wide">
            📄 Télécharger la version officielle du PTA {ptaDoc.year}
          </a>
        )}
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">

        {/* Global progress bar */}
        <div className="bg-gray-50 rounded-xl p-6 mb-10 border border-gray-100">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-gray-700">Global progress</span>
            <span className="font-bold text-green-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-green-600 h-4 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-gray-400 text-sm mt-2">{completed} activités achevées sur {total}</p>
        </div>

        {/* Activities list */}
        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{a.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">{a.description}</p>
                  <p className="text-gray-400 text-xs mt-2">Year: {a.year}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ml-4 shrink-0 ${
                  a.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  a.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {a.status === "COMPLETED" ? "Completed" : a.status === "CANCELLED" ? "Cancelled" : "In Progress"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Retour à l'accueil</Link>
        </div>
      </section>
    </main>
  );
}