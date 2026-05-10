"use client";

import { useRouter } from "next/navigation";
import { Application, Opportunity } from "@prisma/client";

type CandidatureWithOpportunity = Application & {
  opportunity: Pick<Opportunity, "title" | "type">;
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
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="font-semibold text-gray-800">{a.fullName}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              a.opportunity.type === "JOB"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}>
              {a.opportunity.type === "JOB" ? "Emploi" : "Formation"}
            </span>
          </div>
          <p className="text-gray-500 text-sm">{a.opportunity.title}</p>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
            {a.phone && (
              <a href={`https://wa.me/${a.phone.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:underline">
                📱 {a.phone} (WhatsApp)
              </a>
            )}
            {a.email && (
              <a href={`mailto:${a.email}`}
                className="flex items-center gap-1 text-blue-600 hover:underline">
                📧 {a.email}
              </a>
            )}
          </div>

          {a.message && (
            <p className="text-gray-600 text-sm mt-3 bg-gray-50 rounded-lg p-3 italic">
              "{a.message}"
            </p>
          )}

          {a.cvUrl && (
            <div className="mt-3 flex flex-wrap gap-2">
              {a.cvUrl.split(" | ").map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline border border-blue-100 px-3 py-1 rounded-lg">
                  📎 Document {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-xs text-gray-400">
            {new Date(a.createdAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <button onClick={handleDelete}
            className="text-red-400 hover:text-red-600 transition text-xs flex items-center gap-1"
            title="Supprimer cette candidature">
            🗑️ Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}