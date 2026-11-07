import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logAdminAction } from "@/lib/audit";
import { opportunitySchema } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = opportunitySchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const opportunity = await prisma.$transaction(async (tx) => {
    const created = await tx.opportunity.create({ data: result.data });
    const action = created.published ? "OPPORTUNITY_SAVED_ONLINE" : "OPPORTUNITY_SAVED_DRAFT";
    await logAdminAction(tx, session, req, action, created.title);
    return created;
  });

  return NextResponse.json(opportunity, { status: 201 });
}
