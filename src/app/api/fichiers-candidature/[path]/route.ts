import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { signedReadUrl } from "@/lib/application-files";
import { logAdminAction } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/request";

interface Context {
  params: Promise<{ path: string }>;
}

export async function GET(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { path } = await params;
  const file = await prisma.applicationFile.findUnique({ where: { path } });
  if (!file?.applicationId) return errorResponse("Document introuvable.", 404);

  const url = await signedReadUrl(path).catch(() => null);
  if (!url) return errorResponse("Document introuvable.", 404);

  await logAdminAction(prisma, session, req, "APPLICATION_FILE_OPENED", file.applicationId);
  return NextResponse.redirect(url);
}
