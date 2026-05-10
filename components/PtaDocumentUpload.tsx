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
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
            className="text-green-700 hover:underline text-sm font-medium">
            📄 PTA {year} — Voir le document actuel
          </a>
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={deleting}
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg transition disabled:opacity-50">
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      )}

      {/* Upload new file */}
      <div className="space-y-3">
        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Ex: 2025-2030"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FileUpload
            bucket="documents"
            accept=".pdf"
            onUpload={(url) => setPdfUrl(url)}
          />
        </div>

        {pdfUrl && (
          <div className="flex items-center gap-3">
            <p className="text-green-600 text-sm">✅ PDF prêt à enregistrer</p>
            <button onClick={handleSave} disabled={saving}
              className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800 transition disabled:opacity-50">
              {saving ? "Enregistrement..." : saved ? "✅ Enregistré" : "Enregistrer"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}