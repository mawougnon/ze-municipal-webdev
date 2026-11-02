import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const { id } = await params;

  await prisma.application.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
