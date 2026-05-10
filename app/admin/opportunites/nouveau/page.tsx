"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouvelleOpportunitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({ type: "JOB", title: "", description: "", deadline: "", price: "" });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/opportunites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        isFree,
        published,
        price: isFree ? null : parseFloat(form.price),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }),
    });
    router.push("/admin/opportunites");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Nouvelle offre</h1>
        <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-xl shadow-sm">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="JOB">Offre d'emploi</option>
              <option value="TRAINING">Formation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input type="text" name="title" onChange={handleChange} required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date limite (optionnel)</label>
            <input type="date" name="deadline" onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Free or paid toggle - Pointer cursor added */}
          <div className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => setIsFree(!isFree)}>
            <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 cursor-pointer" />
            <span className="text-sm text-gray-700 cursor-pointer select-none">Gratuit</span>
          </div>

          {!isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (XOF)</label>
              <input type="number" name="price" onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          
          <div className="flex items-center gap-3 cursor-pointer group w-fit" onClick={() => setPublished(!published)}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 cursor-pointer" />
            <span className="text-sm text-gray-700 cursor-pointer select-none">Publier immédiatement en ligne</span>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Enregistrement..." : published ? "Publier" : "Enregistrer comme brouillon"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}