import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { logSave } from "@/lib/audit";
import { documentSchema, releaseFeaturedPlace } from "@/lib/documents";
import { prisma } from "@/lib/prisma";
import { readBody } from "@/lib/request";

export async function POST(req: Request) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, documentSchema);
  if (invalid) return invalid;

  const document = await prisma.$transaction(async (tx) => {
    await releaseFeaturedPlace(tx, data);
    const created = await tx.document.create({ data });
    await logSave(tx, session, req, "DOCUMENT", created);
    return created;
  });

  return NextResponse.json(document, { status: 201 });
}
