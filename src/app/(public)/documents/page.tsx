import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { publishedDocuments } from "@/lib/documents";
import { LONG_DATE, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Documents",
  description: "Le Plan de Travail Annuel et les bilans de la Mairie des Jeunes de Zè.",
};

export default async function DocumentsPage() {
  const { featured, others } = await publishedDocuments();

  return (
    <main className="min-h-screen bg-white">
      <PageHeader title="Documents" subtitle="Le plan de travail et les bilans de la mairie" />

      <section className="mx-auto max-w-4xl px-6 py-12">
        {featured && (
          <article className="mb-10 border-2 border-gold bg-cream p-6 md:p-8">
            <p className="mb-2 text-xs font-semibold tracking-widest text-green-800 uppercase">
              À la une
            </p>
            <h2 className="font-serif text-2xl font-bold break-words text-gray-900">
              {featured.title}
            </h2>
            <p className="mt-3 whitespace-pre-line text-gray-700">{featured.description}</p>
            <p className="mt-3 text-sm text-gray-600">{formatDate(featured.date, LONG_DATE)}</p>
            <a
              href={featured.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block bg-gold px-6 py-3 text-sm font-semibold tracking-wide text-black uppercase transition hover:bg-gold-hover"
            >
              Lire le document (PDF)
            </a>
          </article>
        )}

        <div className="space-y-4">
          {others.map((document) => (
            <article key={document.id} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <h2 className="font-semibold break-words text-gray-800">{document.title}</h2>
              <p className="mt-1 text-sm whitespace-pre-line text-gray-600">
                {document.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-gray-600">
                  {formatDate(document.date, LONG_DATE)}
                </span>
                <a
                  href={document.fileUrl}
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
