"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { type FocusedPhoto, focusPosition } from "@/lib/focus";

const CONTROL = "rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200";

interface Props {
  photos: FocusedPhoto[];
  title: string;
}

export default function ArticleGallery({ photos, title }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  const total = photos.length;

  const open = (index: number) => {
    setCurrent(index);
    dialog.current?.showModal();
  };
  const move = (step: number) => setCurrent((index) => (index + step + total) % total);

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {photos.map((photo, i) => (
          <li key={photo.url}>
            <button
              type="button"
              onClick={() => open(i)}
              className="relative block aspect-square w-full overflow-hidden rounded-xl bg-gray-100"
            >
              <Image
                src={photo.url}
                alt={`Agrandir la photo ${i + 1} sur ${total} : ${title}`}
                fill
                sizes="(max-width: 768px) 50vw, 256px"
                className="object-cover transition-transform duration-300 hover:scale-105"
                style={{ objectPosition: focusPosition(photo.focusX, photo.focusY) }}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={`Photos : ${title}`}
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") move(1);
          if (e.key === "ArrowLeft") move(-1);
        }}
        className="m-auto max-h-none max-w-none bg-transparent backdrop:bg-black/85"
      >
        <div className="relative h-[80vh] w-[92vw]">
          <Image
            src={photos[current].url}
            alt={`Photo ${current + 1} sur ${total} : ${title}`}
            fill
            sizes="92vw"
            className="object-contain"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          {total > 1 && (
            <button type="button" onClick={() => move(-1)} className={CONTROL}>
              ← Précédente
            </button>
          )}
          <span className="text-sm text-white">
            {current + 1} sur {total}
          </span>
          {total > 1 && (
            <button type="button" onClick={() => move(1)} className={CONTROL}>
              Suivante →
            </button>
          )}
          <button type="button" onClick={() => dialog.current?.close()} className={CONTROL}>
            Fermer
          </button>
        </div>
      </dialog>
    </>
  );
}
