import Link from "next/link";
import AdminBackLink from "@/components/AdminBackLink";
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
        <AdminBackLink />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
          <Link
            href="/admin/documents/nouveau"
            className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
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
            {documents.map((document) => (
              <Link
                key={document.id}
                href={`/admin/documents/${document.id}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-green-300"
              >
                <h2 className="font-semibold break-words text-gray-800">{document.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 ${document.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {document.published ? "Publié" : "Brouillon"}
                  </span>
                  {document.featured && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                      À la une
                    </span>
                  )}
                  <span className="text-gray-500">{formatDate(document.date, LONG_DATE)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
