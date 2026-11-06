import { auth } from "@/auth";
import { logAdminAction } from "@/lib/audit";
import { documentSchema } from "@/lib/documents";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const result = documentSchema.safeParse(await req.json().catch(() => null));
  if (!result.success)
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const { data } = result;
  const document = await prisma.$transaction(async (tx) => {
    // One document at a time is featured. A draft does not take the place of the online one.
    if (data.featured && data.published) {
      await tx.document.updateMany({ where: { featured: true }, data: { featured: false } });
    }
    const created = await tx.document.create({ data });
    const action = created.published ? "DOCUMENT_SAVED_ONLINE" : "DOCUMENT_SAVED_DRAFT";
    await logAdminAction(tx, session, req, action, created.title);
    return created;
  });

  return NextResponse.json(document, { status: 201 });
}
