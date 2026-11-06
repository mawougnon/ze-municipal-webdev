import { auth } from "@/auth";
import { signedReadUrl } from "@/lib/application-files";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: opens a document of an application, for an admin. The link given by storage only
// works for a minute, so it cannot circulate, and each reading is recorded.
export async function GET(req: Request, { params }: { params: Promise<{ path: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { path } = await params;
  const file = await prisma.applicationFile.findUnique({ where: { path } });
  if (!file?.applicationId) {
    return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
  }

  const url = await signedReadUrl(path).catch(() => null);
  if (!url) return NextResponse.json({ error: "Document introuvable." }, { status: 404 });

  await logAdminAction(prisma, session, req, "APPLICATION_FILE_OPENED", file.applicationId);
  return NextResponse.redirect(url);
}
