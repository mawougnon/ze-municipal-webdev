"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";

export default function NouvellePtaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    year: "",
    title: "",
    description: "",
    status: "IN_PROGRESS",
    pdfUrl: "",
  });

  // Update local state when text fields change
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Send the final form data to the Prisma API
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/pta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/pta");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Nouvelle activité PTA</h1>
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          {/* Map through basic text fields for cleaner code */}
          {[
            { label: "Année", name: "year", type: "text", placeholder: "2026" },
            {
              label: "Titre",
              name: "title",
              type: "text",
              placeholder: "Ex: Construction d'un centre de jeunes",
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}

          {/* FileUpload handles PDF storage in the 'documents' bucket */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Document officiel (PDF)
            </label>
            <FileUpload
              bucket="documents"
              accept=".pdf"
              onUpload={(url) => setForm({ ...form, pdfUrl: url })}
            />
            {form.pdfUrl && <p className="mt-1 text-sm text-green-600">✅ Document prêt</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* User selects the current status of the PTA activity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
