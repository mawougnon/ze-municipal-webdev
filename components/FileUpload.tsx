"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { safeFileName } from "@/lib/storage";

interface Props {
  bucket: "photos" | "documents";
  onUpload: (url: string) => void;
  accept?: string;
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1920;

// Phone photos are often over 5 MB and the bucket only takes JPEG and PNG.
// Big images and other formats are redrawn as JPEG with the browser's own decoder;
// a format the browser cannot read (HEIC outside Safari) makes createImageBitmap throw.
async function prepareImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const keep = scale === 1 && file.size <= MAX_BYTES && ["image/jpeg", "image/png"].includes(file.type);
  if (keep) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("encode");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function FileUpload({ bucket, onUpload, accept = "image/*" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;

    setError("");
    setUploading(true);

    let file = picked;
    if (bucket === "photos") {
      try {
        file = await prepareImage(picked);
      } catch {
        setError("Format d'image non pris en charge. Envoyez une photo JPEG ou PNG.");
        setUploading(false);
        return;
      }
    }

    if (file.size > MAX_BYTES) {
      setError("Le fichier dépasse 5 Mo.");
      setUploading(false);
      return;
    }

    const filename = `${Date.now()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: false });

    if (uploadError) {
      setError("L'envoi a échoué. Réessayez.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    onUpload(data.publicUrl);
    setUploading(false);
  }

  return (
    <div>
      <label className="block">
        <span className="sr-only">Choisir un fichier</span>
        <p className="text-sm text-gray-500 mb-1">Cliquez pour choisir un fichier</p>
        <input type="file" accept={accept} onChange={handleUpload} disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
      </label>
      {uploading && <p className="text-sm text-gray-400 mt-1">Envoi en cours...</p>}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
