import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { LONG_DATE, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDocumentsPage() {
  await requireAdmin();

  const documents = await prisma.document.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <Link
            href="/admin/documents/nouveau"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            + Nouveau document
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Aucun document pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((d) => (
              <Link
                key={d.id}
                href={`/admin/documents/${d.id}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-green-300"
              >
                <h2 className="font-semibold break-words text-gray-800">{d.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${d.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {d.published ? "Publié" : "Brouillon"}
                  </span>
                  {d.featured && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                      À la une
                    </span>
                  )}
                  <span className="text-gray-500">{formatDate(d.date, LONG_DATE)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Link href="/admin" className="mt-8 block text-sm text-gray-500 hover:text-gray-800">
          ← Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
