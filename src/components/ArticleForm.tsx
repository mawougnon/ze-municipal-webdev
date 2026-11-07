"use client";

import FileUpload from "@/components/FileUpload";
import PublishButtons, { wantsPublish } from "@/components/PublishButtons";
import { MAX_GALLERY_PHOTOS } from "@/lib/storage";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  id?: string;
  initial: {
    title: string;
    content: string;
    coverImageUrl: string;
    photos: string[];
    published: boolean;
  };
}

const LABEL = "mb-1 block text-sm font-medium text-gray-700";
const REMOVE = "text-sm text-red-600 hover:text-red-800";

export default function ArticleForm({ id, initial }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
  const [photos, setPhotos] = useState(initial.photos);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial.content,
    immediatelyRender: false,
    editorProps: { attributes: { "aria-label": "Contenu de l’article" } },
  });

  async function send(url: string, method: string, body?: object) {
    setSaving(true);
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    }).catch(() => null);

    if (res?.ok) {
      router.push("/admin/articles");
      router.refresh();
      return;
    }
    const answer = await res?.json().catch(() => null);
    setError(answer?.error ?? "L’enregistrement a échoué. Réessayez.");
    setSaving(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = editor?.getHTML() ?? "";
    if (content === "" || content === "<p></p>") {
      setError("Le contenu ne peut pas être vide.");
      return;
    }
    send(id ? `/api/articles/${id}` : "/api/articles", id ? "PUT" : "POST", {
      title,
      content,
      coverImageUrl,
      photos,
      published: wantsPublish(e),
    });
  }

  const toolbarButtons = [
    {
      label: <strong>G</strong>,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="article-title" className={LABEL}>
          Titre
        </label>
        <input
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <p className={LABEL}>Photo de couverture (optionnel)</p>
        <FileUpload bucket="photos" onUpload={setCoverImageUrl} />
        {coverImageUrl && (
          <>
            <div className="relative mt-3 aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={coverImageUrl}
                alt="Aperçu de la couverture"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
            <button type="button" onClick={() => setCoverImageUrl("")} className={`mt-2 ${REMOVE}`}>
              Retirer la couverture
            </button>
          </>
        )}
      </div>

      <div>
        <p className={LABEL}>
          Autres photos ({photos.length} sur {MAX_GALLERY_PHOTOS})
        </p>
        {photos.length < MAX_GALLERY_PHOTOS && (
          <FileUpload
            bucket="photos"
            multiple
            limit={MAX_GALLERY_PHOTOS - photos.length}
            onUpload={(url) => setPhotos((current) => [...current, url])}
          />
        )}
        {photos.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((url, i) => (
              <li key={url}>
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 256px"
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPhotos((current) => current.filter((u) => u !== url))}
                  className={`mt-1 ${REMOVE}`}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className={LABEL}>Contenu</p>
        <div className="mb-2 flex gap-2">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.title}
              type="button"
              onClick={btn.action}
              title={btn.title}
              aria-label={btn.title}
              className="rounded bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
            >
              {btn.label}
            </button>
          ))}
        </div>
        <div className="min-h-[200px] rounded-lg border border-gray-300 bg-white p-4 focus-within:ring-2 focus-within:ring-blue-500">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <PublishButtons isPublished={initial.published} saving={saving} />
        {id && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (confirm("Supprimer cet article définitivement ?")) {
                send(`/api/articles/${id}`, "DELETE");
              }
            }}
            className="rounded-lg bg-red-600 px-6 py-2 text-white transition hover:bg-red-700 disabled:opacity-50"
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
  );
}
