"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";

interface Props {
  currentPdfUrl?: string | null;
  currentYear?: string | null;
}

export default function PtaDocumentUpload({ currentPdfUrl, currentYear }: Props) {
  const [pdfUrl, setPdfUrl] = useState(currentPdfUrl ?? "");
  const [year, setYear] = useState(currentYear ?? "2025-2030");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    if (!pdfUrl) return;
    setSaving(true);
    await fetch("/api/pta-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdfUrl, year }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleDelete() {
    if (!confirm("Supprimer le document officiel ?")) return;
    setDeleting(true);
    await fetch("/api/pta-document", { method: "DELETE" });
    setPdfUrl("");
    setDeleting(false);
  }

  return (
    <div className="space-y-4">
      {/* If a PDF already exists */}
      {pdfUrl && (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-700 hover:underline"
          >
            📄 PTA {year} : voir le document actuel
          </a>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      )}

      {/* Upload new file */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ex: 2025-2030"
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <FileUpload bucket="documents" accept=".pdf" onUpload={(url) => setPdfUrl(url)} />
        </div>

        {pdfUrl && (
          <div className="flex items-center gap-3">
            <p className="text-sm text-green-600">✅ PDF prêt à enregistrer</p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : saved ? "✅ Enregistré" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
