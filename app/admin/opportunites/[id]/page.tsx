"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function ModifierOpportunitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFree, setIsFree] = useState(true);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    type: "JOB",
    title: "",
    description: "",
    deadline: "",
    price: "",
  });

  useEffect(() => {
    fetch(`/api/opportunites/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setForm({
          type: data.type,
          title: data.title,
          description: data.description,
          deadline: data.deadline ? data.deadline.split("T")[0] : "",
          price: data.price ? String(data.price) : "",
        });
        setIsFree(data.isFree);
        setPublished(data.published);
      })
      .catch(() => setError("Impossible de charger l'offre."));
  }, [id]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/opportunites/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        isFree,
        published,
        price: isFree ? null : parseFloat(form.price),
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "L'enregistrement a échoué. Réessayez.");
      setLoading(false);
      return;
    }
    router.push("/admin/opportunites");
    router.refresh();
  }

  async function handleDelete() {
    // Applications are deleted with their offer (cascade): say so before it happens
    if (
      !confirm(
        "Supprimer cette offre définitivement ? Toutes ses candidatures seront aussi supprimées.",
      )
    )
      return;
    const res = await fetch(`/api/opportunites/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("La suppression a échoué. Réessayez.");
      return;
    }
    router.push("/admin/opportunites");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier l'offre</h1>
        <form onSubmit={handleUpdate} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="JOB">Offre d'emploi</option>
              <option value="TRAINING">Formation</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

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
            <label className="mb-1 block text-sm font-medium text-gray-700">Date limite</label>
            <input
              type="date"
              name="deadline"
              value={form.deadline}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Gratuit</span>
          </label>

          {!isFree && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Prix (XOF)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}

          <label className="flex w-fit cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Publier cette offre</span>
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

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
