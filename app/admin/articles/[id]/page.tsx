"use client";

import PublishButtons, { wantsPublish } from "@/components/PublishButtons";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FileUpload from "@/components/FileUpload";
import Image from "next/image";

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
    const nextPublished = wantsPublish(e);
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
        body: JSON.stringify({ title, content, coverImageUrl, published: nextPublished }),
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
    {
      label: <strong>B</strong>,
      action: () => editor?.chain().focus().toggleBold().run(),
      title: "Gras",
    },
    {
      label: <em>I</em>,
      action: () => editor?.chain().focus().toggleItalic().run(),
      title: "Italique",
    },
    {
      label: "• Liste",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      title: "Liste à puces",
    },
  ];

  if (loading) return <div className="p-8 text-center">Chargement des données de l’article...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">
          {isEditing ? "Modifier l'article" : "Nouvel article"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Image de couverture
            </label>
            <FileUpload bucket="photos" onUpload={(url) => setCoverImageUrl(url)} />
            {coverImageUrl && (
              <div className="relative mt-3 h-48 w-full overflow-hidden rounded-lg">
                <Image
                  src={coverImageUrl}
                  alt="Aperçu de la couverture"
                  fill
                  sizes="768px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Content Editor */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contenu</label>
            <div className="mb-2 flex gap-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  onClick={btn.action}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-100"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="min-h-[200px] rounded-lg border border-gray-300 bg-white p-4 text-gray-900">
              <EditorContent editor={editor} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Form Actions */}
          <div className="flex flex-wrap gap-3">
            <PublishButtons isPublished={published} saving={isSaving} />

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
                className="rounded-lg bg-red-500 px-6 py-2 text-white transition hover:bg-red-600"
              >
                Supprimer
              </button>
            )}

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
