import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { logAdminAction, logSave } from "@/lib/audit";
import { opportunitySchema } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";
import { errorResponse, readBody } from "@/lib/request";
import { removePublicFile } from "@/lib/supabase-admin";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, opportunitySchema);
  if (invalid) return invalid;

  const { id } = await params;
  const saved = await prisma
    .$transaction(async (tx) => {
      const previous = await tx.opportunity.findUniqueOrThrow({ where: { id } });
      const opportunity = await tx.opportunity.update({ where: { id }, data });
      await logSave(tx, session, req, "OPPORTUNITY", opportunity);
      return { opportunity, previous };
    })
    .catch(() => null);
  if (!saved) return errorResponse("Offre introuvable.", 404);

  if (saved.previous.imageUrl !== saved.opportunity.imageUrl) {
    await removePublicFile("photos", saved.previous.imageUrl);
  }
  return NextResponse.json(saved.opportunity);
}

export async function DELETE(req: Request, { params }: Context) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { id } = await params;
  const deleted = await prisma
    .$transaction(async (tx) => {
      const opportunity = await tx.opportunity.delete({ where: { id } });
      await logAdminAction(tx, session, req, "OPPORTUNITY_DELETED", opportunity.title);
      return opportunity;
    })
    .catch(() => null);
  if (!deleted) return errorResponse("Offre introuvable.", 404);

  await removePublicFile("photos", deleted.imageUrl);
  return NextResponse.json({ success: true });
}
