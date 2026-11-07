import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logAdminAction } from "@/lib/audit";
import { opportunitySchema } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";
import { removePublicFile } from "@/lib/supabase-admin";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const result = opportunitySchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  try {
    const { opportunity, previous } = await prisma.$transaction(async (tx) => {
      const previous = await tx.opportunity.findUniqueOrThrow({ where: { id } });
      const updated = await tx.opportunity.update({ where: { id }, data: result.data });
      const action = updated.published ? "OPPORTUNITY_SAVED_ONLINE" : "OPPORTUNITY_SAVED_DRAFT";
      await logAdminAction(tx, session, req, action, updated.title);
      return { opportunity: updated, previous };
    });
    if (previous.imageUrl !== opportunity.imageUrl) {
      await removePublicFile("photos", previous.imageUrl);
    }

    return NextResponse.json(opportunity);
  } catch {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.delete({ where: { id } });
      await logAdminAction(tx, session, req, "OPPORTUNITY_DELETED", opportunity.title);
      return opportunity;
    });
    await removePublicFile("photos", deleted.imageUrl);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
  }
}
