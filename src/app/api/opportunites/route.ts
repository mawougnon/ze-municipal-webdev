import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { logSave } from "@/lib/audit";
import { opportunitySchema } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";
import { readBody } from "@/lib/request";

export async function POST(req: Request) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, opportunitySchema);
  if (invalid) return invalid;

  const opportunity = await prisma.$transaction(async (tx) => {
    const created = await tx.opportunity.create({ data });
    await logSave(tx, session, req, "OPPORTUNITY", created);
    return created;
  });

  return NextResponse.json(opportunity, { status: 201 });
}
