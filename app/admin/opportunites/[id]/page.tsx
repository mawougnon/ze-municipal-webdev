"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ModifierOpportunitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [published, setPublished] = useState(false);
  const [form, setForm] = useState({ type: "JOB", title: "", description: "", deadline: "", price: "" });

  useEffect(() => {
    fetch(`/api/opportunites/${id}`).then(r => r.json()).then(data => {
      setForm({
        type: data.type, title: data.title, description: data.description,
        deadline: data.deadline ? data.deadline.split("T")[0] : "",
        price: data.price ? String(data.price) : "",
      });
      setIsFree(data.isFree);
      setPublished(data.published);
    });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/opportunites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form, isFree, published,
        price: isFree ? null : parseFloat(form.price),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }),
    });
    router.push("/admin/opportunites");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette offre définitivement ?")) return;
    await fetch(`/api/opportunites/${id}`, { method: "DELETE" });
    router.push("/admin/opportunites");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Modifier l'offre</h1>
        <form onSubmit={handleUpdate} className="space-y-5 bg-white p-6 rounded-xl shadow-sm">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="JOB">Offre d'emploi</option>
              <option value="TRAINING">Formation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
            <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setIsFree(!isFree)}>
            <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 cursor-pointer" />
            <span className="text-sm text-gray-700 cursor-pointer">Gratuit</span>
          </div>

          {!isFree && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (XOF)</label>
              <input type="number" name="price" value={form.price} onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPublished(!published)}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="w-4 h-4 cursor-pointer" />
            <span className="text-sm text-gray-700 cursor-pointer">Publier cette offre</span>
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

