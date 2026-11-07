import { NextResponse } from "next/server";
import { adminAccess } from "@/lib/admin";
import { articleSchema } from "@/lib/articles";
import { logSave } from "@/lib/audit";
import { prisma } from "@/lib/prisma";
import { readBody } from "@/lib/request";

export async function POST(req: Request) {
  const { session, denied } = await adminAccess();
  if (denied) return denied;

  const { data, invalid } = await readBody(req, articleSchema);
  if (invalid) return invalid;

  const { photos, ...fields } = data;
  const article = await prisma.$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        ...fields,
        photos: { create: photos.map((photo, position) => ({ ...photo, position })) },
      },
    });
    await logSave(tx, session, req, "ARTICLE", created);
    return created;
  });

  return NextResponse.json(article, { status: 201 });
}
