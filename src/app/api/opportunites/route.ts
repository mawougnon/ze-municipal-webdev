import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { offerSchema } from "@/lib/offers";
import { logAdminAction } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = offerSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const opportunity = await prisma.$transaction(async (tx) => {
    const created = await tx.opportunity.create({ data: result.data });
    const action = created.published ? "OFFER_SAVED_ONLINE" : "OFFER_SAVED_DRAFT";
    await logAdminAction(tx, session, req, action, created.title);
    return created;
  });

  revalidatePath("/opportunites");
  revalidatePath("/");

  return NextResponse.json(opportunity, { status: 201 });
}
