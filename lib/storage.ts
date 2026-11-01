// True for the public URL of a file stored directly in one of the project's buckets.
// Anything else (outside domain, other bucket, sub folder, "..") is refused.
export function isProjectFile(url: string, bucket: "photos" | "documents") {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  const name = url.slice(prefix.length);
  return url.startsWith(prefix) && name.length > 0 && !name.includes("/") && !name.includes("..");
}

// Supabase only accepts plain ASCII object names: "Hounkpè CV.pdf" becomes "Hounkpe_CV.pdf".
// Runs of dots are collapsed so a cleaned name never contains "..", which isProjectFile refuses.
export function safeFileName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").replace(/\.{2,}/g, ".");
}
