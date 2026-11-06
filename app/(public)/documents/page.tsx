import type { Metadata } from "next";
import { DOCUMENT_DATE, publishedDocuments } from "@/lib/documents";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Documents | Mairie des Jeunes de Zè",
  description: "Le Plan de Travail Annuel et les bilans de la Mairie des Jeunes de Zè.",
};

export default async function DocumentsPage() {
  const { featured, others } = await publishedDocuments();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 px-6 py-12 text-center text-white">
        <h1 className="text-3xl font-bold">Documents</h1>
        <p className="mt-2 text-green-100">Le plan de travail et les bilans de la mairie</p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        {featured && (
          <article className="mb-10 border-2 border-[#D4AF37] bg-[#FAFAF7] p-6 md:p-8">
            <p className="mb-2 text-xs font-semibold tracking-widest text-green-800 uppercase">
              À la une
            </p>
            <h2 className="font-serif text-2xl font-bold break-words text-gray-900">
              {featured.title}
            </h2>
            <p className="mt-3 whitespace-pre-line text-gray-700">{featured.description}</p>
            <p className="mt-3 text-sm text-gray-600">{formatDate(featured.date, DOCUMENT_DATE)}</p>
            <a
              href={featured.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block bg-[#D4AF37] px-6 py-3 text-sm font-semibold tracking-wide text-black uppercase transition hover:bg-[#b8962e]"
            >
              Lire le document (PDF)
            </a>
          </article>
        )}

        <div className="space-y-4">
          {others.map((d) => (
            <article key={d.id} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="font-semibold break-words text-gray-800">{d.title}</h2>
              <p className="mt-1 text-sm whitespace-pre-line text-gray-600">{d.description}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-600">{formatDate(d.date, DOCUMENT_DATE)}</span>
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-green-800 hover:underline"
                >
                  Lire le document (PDF)
                </a>
              </div>
            </article>
          ))}
        </div>

        {!featured && others.length === 0 && (
          <p className="text-center text-gray-600">Aucun document pour le moment.</p>
        )}
      </section>
    </main>
  );
}
