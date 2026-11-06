"use client";

import { formatDate } from "@/lib/format";
import { useRouter } from "next/navigation";
import { Application, ApplicationFile, Opportunity } from "@prisma/client";
import { whatsappLink } from "@/lib/phone";

type CandidatureWithOpportunity = Application & {
  opportunity: Pick<Opportunity, "title" | "type">;
  files: ApplicationFile[];
};

export default function CandidatureCard({ a }: { a: CandidatureWithOpportunity }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Supprimer la candidature de ${a.fullName} ?`)) return;

    const res = await fetch(`/api/candidatures/${a.id}`, { method: "DELETE" });

    if (res.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la suppression. Réessaie.");
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h2 className="font-semibold text-gray-800">{a.fullName}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                a.opportunity.type === "JOB"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {a.opportunity.type === "JOB" ? "Emploi" : "Formation"}
            </span>
          </div>
          <p className="text-sm text-gray-500">{a.opportunity.title}</p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {a.phone && (
              <a
                href={whatsappLink(a.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:underline"
              >
                📱 {a.phone} (WhatsApp)
              </a>
            )}
            {a.email && (
              <a
                href={`mailto:${a.email}`}
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                📧 {a.email}
              </a>
            )}
          </div>

          {a.message && (
            <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 italic">
              « {a.message} »
            </p>
          )}

          {a.files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.files.map((file, i) => (
                <a
                  key={file.path}
                  href={`/api/fichiers-candidature/${encodeURIComponent(file.path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-blue-100 px-3 py-1 text-sm text-blue-600 hover:underline"
                >
                  📎 Document {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs text-gray-500">
            {formatDate(a.createdAt, {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-400 transition hover:text-red-600"
            title="Supprimer cette candidature"
          >
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
