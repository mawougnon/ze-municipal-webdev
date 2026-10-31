// True for the public URL of a file stored directly in one of the project's buckets.
// Anything else (outside domain, other bucket, sub folder, "..") is refused.
export function isProjectFile(url: string, bucket: "photos" | "documents") {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
  const prefix = `${base}/storage/v1/object/public/${bucket}/`;
  const name = url.slice(prefix.length);
  return url.startsWith(prefix) && name.length > 0 && !name.includes("/") && !name.includes("..");
}
