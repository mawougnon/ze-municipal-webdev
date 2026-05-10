"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import FileUpload from "@/components/FileUpload";

export default function NouvelArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [published, setPublished] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const content = editor?.getHTML() || "";

    if (!content || content === "<p></p>") {
      setError("Le contenu ne peut pas être vide.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, coverImageUrl, published }),
      });

      if (!res.ok) throw new Error("Erreur lors de la création.");

      router.push("/admin/articles");
      router.refresh();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  // Toolbar button config
  const toolbarButtons = [
    {
      label: "G",
      action: () => editor?.chain().focus().toggleBold().run(),
      title: "Gras",
    },
    {
      label: "I",
      action: () => editor?.chain().focus().toggleItalic().run(),
      title: "Italique",
    },
    {
      label: "• Liste",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      title: "Liste",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">
          Nouvel article
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo de couverture (optionnel)
            </label>
            <FileUpload
              bucket="photos"
              onUpload={(url) => setCoverImageUrl(url)}
            />
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="cover preview"
                className="mt-3 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Rich text editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu
            </label>

            {/* Toolbar — explicit text color so buttons are always visible */}
            <div className="flex gap-2 mb-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  onClick={btn.action}
                  title={btn.title}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-800"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Editor wrapper — white background + dark text forced so ProseMirror content is always readable */}
            <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-white focus-within:ring-2 focus-within:ring-blue-500 editor-wrapper">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Error message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Publish toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">
              Publier immédiatement en ligne
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading
                ? "Enregistrement..."
                : published
                ? "Publier"
                : "Enregistrer comme brouillon"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}