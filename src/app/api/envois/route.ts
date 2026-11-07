import { auth } from "@/auth";
import { safeFileName } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const uploadSchema = z.object({
  bucket: z.enum(["photos", "documents"]),
  fileName: z.string().min(1).max(200),
});

// Files go straight to storage: they can exceed the body limit of a server function
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = uploadSchema.safeParse(await req.json().catch(() => null));
  if (!result.success) return NextResponse.json({ error: "Fichier invalide." }, { status: 400 });

  const { bucket, fileName } = result.data;
  const path = `${Date.now()}-${safeFileName(fileName)}`;
  const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
  if (error) {
    console.error("SIGNED_UPLOAD_ERROR", error.message);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }

  return NextResponse.json({ path, token: data.token }, { status: 201 });
}
