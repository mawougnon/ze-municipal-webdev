"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ModifierPtaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ year: "", title: "", description: "", status: "IN_PROGRESS", pdfUrl: "" });

  useEffect(() => {
    fetch(`/api/pta/${id}`).then(r => r.json()).then(data => setForm({
      year: data.year, title: data.title, description: data.description,
      status: data.status, pdfUrl: data.pdfUrl || ""
    }));
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/pta/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/pta");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette activité définitivement ?")) return;
    await fetch(`/api/pta/${id}`, { method: "DELETE" });
    router.push("/admin/pta");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Modifier l'activité</h1>
        <form onSubmit={handleUpdate} className="space-y-5 bg-white p-6 rounded-xl shadow-sm">
          {[
            { label: "Année", name: "year", type: "text" },
            { label: "Titre", name: "title", type: "text" },
            { label: "Lien PDF (optionnel)", name: "pdfUrl", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input type={field.type} name={field.name} value={(form as any)[field.name]}
                onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button type="button" onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">
              Supprimer
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