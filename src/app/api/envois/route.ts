import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { errorResponse, readBody } from "@/lib/request";
import { safeFileName } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "@/lib/zod";

const uploadSchema = z.object({
  bucket: z.enum(["photos", "documents"], { error: "Fichier invalide." }),
  fileName: z.string({ error: "Fichier invalide." }).min(1).max(200),
});

// Files go straight to storage: they can exceed the body limit of a server function
export async function POST(req: Request) {
  const { denied } = await adminAccess();
  if (denied) return denied;

  const { data: body, invalid } = await readBody(req, uploadSchema);
  if (invalid) return invalid;

  const path = `${Date.now()}-${safeFileName(body.fileName)}`;
  const { data, error } = await supabaseAdmin.storage.from(body.bucket).createSignedUploadUrl(path);
  if (error) {
    console.error("SIGNED_UPLOAD_ERROR", error);
    return errorResponse("Erreur serveur.", 500);
  }

  return NextResponse.json({ path, token: data.token }, { status: 201 });
}
