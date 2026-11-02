"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ModifierPtaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    year: "",
    title: "",
    description: "",
    status: "IN_PROGRESS",
    pdfUrl: "",
  });

  useEffect(() => {
    fetch(`/api/pta/${id}`)
      .then((r) => r.json())
      .then((data) =>
        setForm({
          year: data.year,
          title: data.title,
          description: data.description,
          status: data.status,
          pdfUrl: data.pdfUrl || "",
        }),
      );
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
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
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier l’activité</h1>
        <form onSubmit={handleUpdate} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          {[
            { label: "Année", name: "year", type: "text" },
            { label: "Titre", name: "title", type: "text" },
            { label: "Lien PDF (optionnel)", name: "pdfUrl", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Statut</label>
            <select
              name="status"
              value={form.status}
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
              onClick={handleDelete}
              className="rounded-lg bg-red-500 px-6 py-2 text-white transition hover:bg-red-600"
            >
              Supprimer
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
