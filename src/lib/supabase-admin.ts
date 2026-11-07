import "server-only";
import { createClient } from "@supabase/supabase-js";
import { projectFileName } from "@/lib/storage";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// The content is already saved, so a leftover file is not an error for the user
export async function removePublicFile(bucket: "photos" | "documents", url: string | null) {
  const name = url && projectFileName(url, bucket);
  if (!name) return;
  try {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([name]);
    if (error) throw error;
  } catch (error) {
    console.error("STORAGE_REMOVE_ERROR", bucket, error);
  }
}
