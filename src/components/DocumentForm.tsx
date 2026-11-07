"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import PublishButtons, { wantsPublish } from "@/components/PublishButtons";
import { useAdminRequest } from "@/components/useAdminRequest";

interface Props {
  id?: string;
  initial: {
    title: string;
    description: string;
    fileUrl: string;
    date: string; // YYYY-MM-DD
    featured: boolean;
    published: boolean;
  };
}

const FIELD = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
const LABEL = "mb-1 block text-sm font-medium text-gray-700";

export default function DocumentForm({ id, initial }: Props) {
  const { saving, error, send } = useAdminRequest("/admin/documents");
  const [fileUrl, setFileUrl] = useState(initial.fileUrl);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    send(id ? `/api/documents/${id}` : "/api/documents", id ? "PUT" : "POST", {
      title: form.get("title"),
      description: form.get("description"),
      date: form.get("date"),
      featured: form.get("featured") === "on",
      fileUrl,
      published: wantsPublish(e),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="document-title" className={LABEL}>
          Titre
        </label>
        <input
          id="document-title"
          name="title"
          required
          minLength={3}
          maxLength={200}
          defaultValue={initial.title}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="document-description" className={LABEL}>
          Description
        </label>
        <textarea
          id="document-description"
          name="description"
          required
          rows={4}
          maxLength={2000}
          defaultValue={initial.description}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="document-date" className={LABEL}>
          Date du document
        </label>
        <input
          id="document-date"
          name="date"
          type="date"
          required
          defaultValue={initial.date}
          className={FIELD}
        />
      </div>

      <div>
        <p className={LABEL}>Fichier PDF (5 Mo au plus)</p>
        {fileUrl && (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 block text-sm text-green-700 hover:underline"
          >
            Voir le fichier joint
          </a>
        )}
        <FileUpload bucket="documents" accept=".pdf,application/pdf" onUpload={setFileUrl} />
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initial.featured}
          className="mt-0.5"
        />
        <span>
          Mettre à la une, comme le Plan de Travail Annuel. Une fois publié, il remplace le document
          actuellement à la une.
        </span>
      </label>

      <div className="flex flex-wrap gap-3 pt-2">
        <PublishButtons isPublished={initial.published} saving={saving} />
        {id && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (confirm("Supprimer ce document définitivement ?")) {
                send(`/api/documents/${id}`, "DELETE");
              }
            }}
            className="rounded-lg border border-red-200 px-6 py-2 text-red-600 transition hover:border-red-400 disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>
    </form>
  );
}
