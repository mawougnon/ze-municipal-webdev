// 10 photos per article, with the cover
export const MAX_GALLERY_PHOTOS = 9;

// null for anything but a file directly in this bucket
export function projectFileName(url: string, bucket: "photos" | "documents") {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  try {
    const name = decodeURIComponent(url.slice(prefix.length));
    return name && !name.includes("/") && !name.includes("..") ? name : null;
  } catch {
    return null;
  }
}

export function isProjectFile(url: string, bucket: "photos" | "documents") {
  return projectFileName(url, bucket) !== null;
}

// Supabase only accepts plain ASCII object names
export function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/\.{2,}/g, ".");
}
