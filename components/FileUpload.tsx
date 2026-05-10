"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  bucket: "photos" | "documents";
  onUpload: (url: string) => void;
  accept?: string;
}

export default function FileUpload({ bucket, onUpload, accept = "image/*" }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    // Unique filename to avoid collisions
    const filename = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: false });

    if (error) {
      alert("Erreur lors de l'upload. Réessayez.");
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
    </div>
  );
}