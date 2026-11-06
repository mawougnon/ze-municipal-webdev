// The name of a file stored directly in one of the project's public buckets, read from its
// public URL. Anything else (outside domain, other bucket, sub folder, "..") gives null.
export function projectFileName(url: string, bucket: "photos" | "documents") {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  if (!url.startsWith(prefix)) return null;
  try {
    // Checked once decoded: %2F and %2e%2e are a slash and ".." as well
    const name = decodeURIComponent(url.slice(prefix.length));
    return name && !name.includes("/") && !name.includes("..") ? name : null;
  } catch {
    return null;
  }
}

export function isProjectFile(url: string, bucket: "photos" | "documents") {
  return projectFileName(url, bucket) !== null;
}

// Supabase only accepts plain ASCII object names: "Hounkpè CV.pdf" becomes "Hounkpe_CV.pdf".
// Runs of dots are collapsed so a cleaned name never contains "..", which isProjectFile refuses.
export function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/\.{2,}/g, ".");
}
