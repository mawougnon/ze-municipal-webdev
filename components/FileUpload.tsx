"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  bucket: "photos" | "documents";
  onUpload: (url: string) => void;
  accept?: string;
  multiple?: boolean;
  limit?: number;
}

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_SIDE = 1920;

// Phone photos are often over 5 MB and the bucket only takes JPEG and PNG.
// Big images and other formats are redrawn as JPEG with the browser's own decoder;
// a format the browser cannot read (HEIC outside Safari) makes createImageBitmap throw.
async function prepareImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const keep =
    scale === 1 && file.size <= MAX_BYTES && ["image/jpeg", "image/png"].includes(file.type);
  if (keep) return file;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  if (!blob) throw new Error("encode");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export default function FileUpload({
  bucket,
  onUpload,
  accept = "image/*",
  multiple,
  limit,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Returns what went wrong, if anything
  async function send(picked: File) {
    let file = picked;
    if (bucket === "photos") {
      try {
        file = await prepareImage(picked);
      } catch {
        return "Format d'image non pris en charge. Envoyez une photo JPEG ou PNG.";
      }
    }
    if (file.size > MAX_BYTES) return "Le fichier dépasse 5 Mo.";

    // The server decides who may upload and gives a one-time link
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, fileName: file.name }),
    }).catch(() => null);
    const upload = res?.ok ? await res.json() : null;
    const { error: uploadError } = upload
      ? await supabase.storage.from(bucket).uploadToSignedUrl(upload.path, upload.token, file)
      : { error: true };
    if (uploadError) return "L'envoi a échoué. Réessayez.";

    onUpload(supabase.storage.from(bucket).getPublicUrl(upload.path).data.publicUrl);
    return null;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    if (picked.length === 0) return;

    setError("");
    setUploading(true);
    const problems: string[] = [];
    for (const file of picked.slice(0, limit)) {
      const problem = await send(file);
      if (problem) problems.push(multiple ? `${file.name} : ${problem}` : problem);
    }
    if (limit !== undefined && picked.length > limit) {
      problems.push(`Seules les ${limit} premières photos ont été gardées.`);
    }
    setError(problems.join(" "));
    setUploading(false);
    // The field is ready for the next photos
    if (multiple) input.value = "";
  }

  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-sm text-gray-500">
          {multiple ? "Choisir une ou plusieurs photos" : "Choisir un fichier"}
        </span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleUpload}
          disabled={uploading}
          className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-700 hover:file:bg-green-100"
        />
      </label>
      {uploading && <p className="mt-1 text-sm text-gray-400">Envoi en cours...</p>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
