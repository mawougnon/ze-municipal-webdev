"use client";

import Image from "next/image";
import { focusPosition } from "@/lib/focus";

interface Props {
  src: string;
  alt: string;
  focusX: number;
  focusY: number;
  onChange: (focusX: number, focusY: number) => void;
  previewAspect?: string;
}

const SLIDER = "flex items-center gap-3 text-sm text-gray-700";

export default function FocusPicker({ src, alt, focusX, focusY, onChange, previewAspect }: Props) {
  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    onChange(
      Math.round(((e.clientX - box.left) / box.width) * 100),
      Math.round(((e.clientY - box.top) / box.height) * 100),
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <p className="text-sm text-gray-600">
        Cliquez sur la partie à garder visible dans les vignettes, ou utilisez les curseurs.
      </p>
      <div className="relative inline-block max-w-full align-top">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          sizes="(max-width: 768px) 100vw, 768px"
          onClick={handleClick}
          className="block h-auto max-h-80 w-auto max-w-full cursor-crosshair rounded-lg"
        />
        <span
          aria-hidden
          style={{ left: `${focusX}%`, top: `${focusY}%` }}
          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-green-700/70 shadow"
        />
      </div>
      <label className={SLIDER}>
        <span className="w-20 shrink-0">Horizontal</span>
        <input
          type="range"
          min={0}
          max={100}
          value={focusX}
          onChange={(e) => onChange(Number(e.target.value), focusY)}
          className="w-full accent-green-700"
        />
      </label>
      <label className={SLIDER}>
        <span className="w-20 shrink-0">Vertical</span>
        <input
          type="range"
          min={0}
          max={100}
          value={focusY}
          onChange={(e) => onChange(focusX, Number(e.target.value))}
          className="w-full accent-green-700"
        />
      </label>
      {previewAspect && (
        <div>
          <p className="mb-1 text-sm text-gray-600">Aperçu de la vignette</p>
          <div
            className={`relative w-full max-w-xs overflow-hidden rounded-lg bg-gray-100 ${previewAspect}`}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="320px"
              className="object-cover"
              style={{ objectPosition: focusPosition(focusX, focusY) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
