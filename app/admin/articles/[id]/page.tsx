"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; 
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FileUpload from "@/components/FileUpload";

export default function ArticleFormPage() {
  const router = useRouter();
  const { id } = useParams(); // Retrieves ID from URL (e.g., "new" or "clm123...")
  const isEditing = id && id !== "nouveau" && id !== "new";

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(isEditing); // Loading state if we are in edit mode
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [published, setPublished] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
  });

  // 1. FETCH EXISTING DATA IF EDITING
  useEffect(() => {
    if (isEditing) {
      fetch(`/api/articles/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de charger l'article.");
          return res.json();
        })
        .then((data) => {
          setTitle(data.title);
          setCoverImageUrl(data.coverImageUrl || "");
          setPublished(data.published);
          if (editor) {
            editor.commands.setContent(data.content);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Impossible de charger l'article.");
          setLoading(false);
        });
    }
  }, [id, editor, isEditing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    const content = editor?.getHTML() || "";

    // Validation
    if (!content || content === "<p></p>") {
      setError("Le contenu ne peut pas être vide.");
      setIsSaving(false);
      return;
    }

    try {
      // 2. DYNAMICALLY ADAPT METHOD AND URL
      const url = isEditing ? `/api/articles/${id}` : "/api/articles";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, coverImageUrl, published }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Échec de l'enregistrement.");
      }

      // Succès : redirection puis rafraîchissement des données
      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  }

  // Configuration de la barre d'outils
  const toolbarButtons = [
    { label: <strong>B</strong>, action: () => editor?.chain().focus().toggleBold().run(), title: "Gras" },
    { label: <em>I</em>, action: () => editor?.chain().focus().toggleItalic().run(), title: "Italique" },
    { label: "• Liste", action: () => editor?.chain().focus().toggleBulletList().run(), title: "Liste à puces" },
  ];

  if (loading) return <div className="p-8 text-center">Chargement des données de l'article...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          {isEditing ? "Modifier l'article" : "Nouvel article"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image de couverture</label>
            <FileUpload bucket="photos" onUpload={(url) => setCoverImageUrl(url)} />
            {coverImageUrl && (
              <img src={coverImageUrl} alt="cover preview" className="mt-3 w-full h-48 object-cover rounded-lg" />
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <div className="flex gap-2 mb-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  onClick={btn.action}
                  className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded text-sm font-semibold text-gray-800"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-white text-gray-900">
              <EditorContent editor={editor} />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Visibility Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Publier immédiatement</span>
          </label>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : published ? "Publier" : "Enregistrer comme brouillon"}
            </button>

            {/* NOUVEAU : Bouton supprimer uniquement en mode édition */}
            {isEditing && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm("Supprimer cet article définitivement ?")) {
                    setIsSaving(true);
                    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
                    if (!res.ok) {
                      setError("La suppression a échoué. Réessayez.");
                      setIsSaving(false);
                      return;
                    }
                    router.push("/admin/articles");
                    router.refresh();
                  }
                }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Supprimer
              </button>
            )}

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
            
        </form>
      </div>
    </main>
  );
}

