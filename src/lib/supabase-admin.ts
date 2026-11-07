import "server-only";
import { createClient } from "@supabase/supabase-js";
import { projectFileName } from "@/lib/storage";

// Full access to storage, with the secret key: server code only. Browsers have no right
// on the storage API at all, they only receive one-time upload links issued here.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// The content change is already saved at this point: a leftover file must not turn it into
// an error for the person, so a failure is only reported in the logs.
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
