import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { offerSchema } from "@/lib/offers";
import { logAdminAction } from "@/lib/audit";
import { removePublicFile } from "@/lib/supabase-admin";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const result = offerSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  try {
    const { opportunity, previous } = await prisma.$transaction(async (tx) => {
      const previous = await tx.opportunity.findUniqueOrThrow({ where: { id } });
      const updated = await tx.opportunity.update({ where: { id }, data: result.data });
      const action = updated.published ? "OFFER_SAVED_ONLINE" : "OFFER_SAVED_DRAFT";
      await logAdminAction(tx, session, req, action, updated.title);
      return { opportunity: updated, previous };
    });
    if (previous.imageUrl !== opportunity.imageUrl) {
      await removePublicFile("photos", previous.imageUrl);
    }

    revalidatePath("/opportunites");
    revalidatePath("/");

    return NextResponse.json(opportunity);
  } catch {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      const offer = await tx.opportunity.delete({ where: { id } });
      await logAdminAction(tx, session, req, "OFFER_DELETED", offer.title);
      return offer;
    });
    await removePublicFile("photos", deleted.imageUrl);

    // 3. Mise à jour du cache après suppression
    revalidatePath("/opportunites");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
}
