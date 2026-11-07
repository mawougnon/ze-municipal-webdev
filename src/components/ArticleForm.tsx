"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import FocusPicker from "@/components/FocusPicker";
import PublishButtons, { wantsPublish } from "@/components/PublishButtons";
import { useAdminRequest } from "@/components/useAdminRequest";
import { type FocusedPhoto, focusPosition } from "@/lib/focus";
import { MAX_GALLERY_PHOTOS } from "@/lib/storage";

interface Props {
  id?: string;
  initial: {
    title: string;
    content: string;
    coverImageUrl: string;
    coverFocusX: number;
    coverFocusY: number;
    photos: FocusedPhoto[];
    published: boolean;
  };
}

const LABEL = "mb-1 block text-sm font-medium text-gray-700";
const REMOVE = "text-sm text-red-600 hover:text-red-800";

export default function ArticleForm({ id, initial }: Props) {
  const router = useRouter();
  const { saving, error, setError, send } = useAdminRequest("/admin/articles");
  const [title, setTitle] = useState(initial.title);
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
  const [coverFocus, setCoverFocus] = useState({ x: initial.coverFocusX, y: initial.coverFocusY });
  const [photos, setPhotos] = useState(initial.photos);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initial.content,
    immediatelyRender: false,
    editorProps: { attributes: { "aria-label": "Contenu de l’article" } },
  });

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
      coverFocusX: coverFocus.x,
      coverFocusY: coverFocus.y,
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
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-600 focus:outline-none"
        />
      </div>

      <div>
        <p className={LABEL}>Photo de couverture (optionnel)</p>
        <FileUpload
          bucket="photos"
          onUpload={(url) => {
            setCoverImageUrl(url);
            setCoverFocus({ x: 50, y: 50 });
          }}
        />
        {coverImageUrl && (
          <>
            <FocusPicker
              src={coverImageUrl}
              alt="Aperçu de la couverture"
              focusX={coverFocus.x}
              focusY={coverFocus.y}
              onChange={(x, y) => setCoverFocus({ x, y })}
              previewAspect="aspect-[2/1]"
            />
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
            onUpload={(url) =>
              setPhotos((current) => [...current, { url, focusX: 50, focusY: 50 }])
            }
          />
        )}
        {photos.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map(({ url, focusX, focusY }, i) => (
              <li key={url}>
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={url}
                    alt={`Photo ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 256px"
                    className="object-cover"
                    style={{ objectPosition: focusPosition(focusX, focusY) }}
                  />
                </div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-sm text-green-800">Cadrer</summary>
                  <FocusPicker
                    src={url}
                    alt={`Cadrage de la photo ${i + 1}`}
                    focusX={focusX}
                    focusY={focusY}
                    onChange={(x, y) =>
                      setPhotos((current) =>
                        current.map((photo) =>
                          photo.url === url ? { url, focusX: x, focusY: y } : photo,
                        ),
                      )
                    }
                  />
                </details>
                <button
                  type="button"
                  onClick={() =>
                    setPhotos((current) => current.filter((photo) => photo.url !== url))
                  }
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
        <div className="min-h-[200px] rounded-lg border border-gray-300 bg-white p-4 focus-within:ring-2 focus-within:ring-green-600">
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
