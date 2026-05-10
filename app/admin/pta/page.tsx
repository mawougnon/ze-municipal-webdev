import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PtaDocumentUpload from "@/components/PtaDocumentUpload";

export const dynamic = "force-dynamic";

export default async function PtaPage() {
  // Fetch data
  const activities = await prisma.ptaActivity.findMany({ orderBy: { updatedAt: "desc" } });
  const ptaDoc = await prisma.ptaDocument.findFirst({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold text-gray-800 mb-8">Plan de Travail Annuel</h1>

        {/* Official document section (single PDF) */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-8">
          <h2 className="font-semibold text-gray-700 mb-4">Document officiel (PDF unique)</h2>
          {ptaDoc ? (
            <PtaDocumentUpload
              currentPdfUrl={ptaDoc.pdfUrl}
              currentYear={ptaDoc.year}
            />
          ) : (
            <PtaDocumentUpload />
          )}
        </div>

        {/* Activities list section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-semibold text-gray-700">Activités</h2>
          <Link href="/admin/pta/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
            + Nouvelle activité
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">Aucune activité pour le moment.</div>
        ) : (
          <div className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-800">{a.title}</h2>
                  <div className="flex gap-3 mt-1">
                    <span className="text-gray-400 text-sm">{a.year}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                      a.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {/* Status label */}
                      {a.status === "COMPLETED" ? "Terminé" : a.status === "CANCELLED" ? "Annulé" : "En cours"}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/pta/${a.id}`} className="text-blue-600 hover:underline text-sm">Modifier</Link>
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Retour au tableau de bord</Link>
        </div>

      </div>
    </main>
  );
}