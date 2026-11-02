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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la création.");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
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
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Nouvel article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Photo de couverture (optionnel)
            </label>
            <FileUpload bucket="photos" onUpload={(url) => setCoverImageUrl(url)} />
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="cover preview"
                className="mt-3 h-48 w-full rounded-lg object-cover"
              />
            )}
          </div>

          {/* Rich text editor */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Contenu</label>

            {/* Toolbar: explicit text color so buttons are always visible */}
            <div className="mb-2 flex gap-2">
              {toolbarButtons.map((btn) => (
                <button
                  key={btn.title}
                  type="button"
                  onClick={btn.action}
                  title={btn.title}
                  className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Editor wrapper: white background + dark text forced so ProseMirror content is always readable */}
            <div className="editor-wrapper min-h-[200px] rounded-lg border border-gray-300 bg-white p-4 focus-within:ring-2 focus-within:ring-blue-500">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Error message */}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Publish toggle */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">Publier immédiatement en ligne</span>
          </label>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
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
