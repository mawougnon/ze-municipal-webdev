"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import PublishButtons, { wantsPublish } from "@/components/PublishButtons";
import { useAdminRequest } from "@/components/useAdminRequest";

interface Props {
  id?: string;
  initial: {
    type: string;
    title: string;
    description: string;
    deadline: string; // YYYY-MM-DD, or empty
    isFree: boolean;
    price: string;
    imageUrl: string;
    published: boolean;
  };
}

const LABEL = "mb-1 block text-sm font-medium text-gray-700";
const FIELD =
  "w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none";

export default function OpportunityForm({ id, initial }: Props) {
  const router = useRouter();
  const { saving, error, send } = useAdminRequest("/admin/opportunites");
  const [isFree, setIsFree] = useState(initial.isFree);
  const [imageUrl, setImageUrl] = useState(initial.imageUrl);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const deadline = form.get("deadline") as string;
    send(id ? `/api/opportunites/${id}` : "/api/opportunites", id ? "PUT" : "POST", {
      type: form.get("type"),
      title: form.get("title"),
      description: form.get("description"),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      isFree,
      price: isFree ? null : Number(form.get("price")),
      imageUrl,
      published: wantsPublish(e),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
      <div>
        <label htmlFor="opportunity-type" className={LABEL}>
          Type
        </label>
        <select id="opportunity-type" name="type" defaultValue={initial.type} className={FIELD}>
          <option value="JOB">Offre d’emploi</option>
          <option value="TRAINING">Formation</option>
        </select>
      </div>

      <div>
        <label htmlFor="opportunity-title" className={LABEL}>
          Titre
        </label>
        <input
          id="opportunity-title"
          name="title"
          required
          minLength={3}
          maxLength={200}
          defaultValue={initial.title}
          className={FIELD}
        />
      </div>

      <div>
        <p className={LABEL}>Affiche (optionnel)</p>
        <FileUpload bucket="photos" onUpload={setImageUrl} />
        {imageUrl && (
          <>
            <div className="relative mt-3 aspect-[3/2] w-full overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={imageUrl}
                alt="Aperçu de l’affiche"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="mt-2 text-sm text-red-700 hover:text-red-900"
            >
              Retirer l’affiche
            </button>
          </>
        )}
      </div>

      <div>
        <label htmlFor="opportunity-description" className={LABEL}>
          Description
        </label>
        <textarea
          id="opportunity-description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={initial.description}
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="opportunity-deadline" className={LABEL}>
          Date limite (optionnel)
        </label>
        <input
          id="opportunity-deadline"
          name="deadline"
          type="date"
          defaultValue={initial.deadline}
          className={FIELD}
        />
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isFree}
          onChange={(e) => setIsFree(e.target.checked)}
          className="h-4 w-4 cursor-pointer"
        />
        <span className="text-sm text-gray-700 select-none">Gratuit</span>
      </label>

      {!isFree && (
        <div>
          <label htmlFor="opportunity-price" className={LABEL}>
            Prix (XOF)
          </label>
          <input
            id="opportunity-price"
            name="price"
            type="number"
            min={1}
            required
            defaultValue={initial.price}
            className={FIELD}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <PublishButtons isPublished={initial.published} saving={saving} />
        {id && (
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (
                confirm(
                  "Supprimer cette offre définitivement ? Toutes ses candidatures seront aussi supprimées.",
                )
              ) {
                send(`/api/opportunites/${id}`, "DELETE");
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
          className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
