import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { offerSchema } from "@/lib/offers";
import { logAdminAction } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;
  const result = offerSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  try {
    const opportunity = await prisma.$transaction(async (tx) => {
      const updated = await tx.opportunity.update({ where: { id }, data: result.data });
      const action = updated.published ? "OFFER_SAVED_ONLINE" : "OFFER_SAVED_DRAFT";
      await logAdminAction(tx, session, req, action, updated.title);
      return updated;
    });

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
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.opportunity.delete({ where: { id } });
      await logAdminAction(tx, session, req, "OFFER_DELETED", deleted.title);
    });

    // 3. Mise à jour du cache après suppression
    revalidatePath("/opportunites");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }
}
