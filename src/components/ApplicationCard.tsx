"use client";

import { Application, ApplicationFile, Opportunity } from "@prisma/client";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaPaperclip, FaTrash, FaWhatsapp } from "react-icons/fa";
import { formatDate } from "@/lib/format";
import { whatsappLink } from "@/lib/phone";

type ApplicationWithOpportunity = Application & {
  opportunity: Pick<Opportunity, "title" | "type">;
  files: ApplicationFile[];
};

interface Props {
  application: ApplicationWithOpportunity;
}

export default function ApplicationCard({ application }: Props) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Supprimer la candidature de ${application.fullName} ?`)) return;

    const response = await fetch(`/api/candidatures/${application.id}`, { method: "DELETE" });

    if (response.ok) {
      router.refresh();
    } else {
      alert("La suppression a échoué. Réessayez.");
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h2 className="font-semibold text-gray-800">{application.fullName}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                application.opportunity.type === "JOB"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {application.opportunity.type === "JOB" ? "Emploi" : "Formation"}
            </span>
          </div>
          <p className="text-sm text-gray-500">{application.opportunity.title}</p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
            {application.phone && (
              <a
                href={whatsappLink(application.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-600 hover:underline"
              >
                <FaWhatsapp aria-hidden /> {application.phone} (WhatsApp)
              </a>
            )}
            {application.email && (
              <a
                href={`mailto:${application.email}`}
                className="flex items-center gap-1 text-green-800 hover:underline"
              >
                <FaEnvelope aria-hidden /> {application.email}
              </a>
            )}
          </div>

          {application.message && (
            <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600 italic">
              « {application.message} »
            </p>
          )}

          {application.files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {application.files.map((file, i) => (
                <a
                  key={file.path}
                  href={`/api/fichiers-candidature/${encodeURIComponent(file.path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm text-green-800 hover:underline"
                >
                  <FaPaperclip aria-hidden className="mr-1 inline" />
                  Document {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="text-xs text-gray-500">
            {formatDate(application.createdAt, {
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
            <FaTrash aria-hidden /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
