import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PtaDocumentUpload from "@/components/PtaDocumentUpload";

export const dynamic = "force-dynamic";

export default async function PtaPage() {
  await requireAdmin();

  // Fetch data
  const activities = await prisma.ptaActivity.findMany({ orderBy: { updatedAt: "desc" } });
  const ptaDoc = await prisma.ptaDocument.findFirst({ orderBy: { updatedAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Plan de Travail Annuel</h1>

        {/* Official document section (single PDF) */}
        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-gray-700">Document officiel (PDF unique)</h2>
          {ptaDoc ? (
            <PtaDocumentUpload currentPdfUrl={ptaDoc.pdfUrl} currentYear={ptaDoc.year} />
          ) : (
            <PtaDocumentUpload />
          )}
        </div>

        {/* Activities list section */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Activités</h2>
          <Link
            href="/admin/pta/nouveau"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700"
          >
            + Nouvelle activité
          </Link>
        </div>

        {activities.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400">
            Aucune activité pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{a.title}</h2>
                  <div className="mt-1 flex gap-3">
                    <span className="text-sm text-gray-400">{a.year}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        a.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : a.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {/* Status label */}
                      {a.status === "COMPLETED"
                        ? "Terminé"
                        : a.status === "CANCELLED"
                          ? "Annulé"
                          : "En cours"}
                    </span>
                  </div>
                </div>
                <Link href={`/admin/pta/${a.id}`} className="text-sm text-blue-600 hover:underline">
                  Modifier
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-6">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
