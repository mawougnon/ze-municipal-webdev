import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; // 1. Importer l'outil

// GET — fetch the single PTA document
export async function GET() {
  const doc = await prisma.ptaDocument.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(doc);
}

// POST — create or update the PTA document (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { pdfUrl, year } = await req.json();

  await prisma.ptaDocument.deleteMany();
  const doc = await prisma.ptaDocument.create({ data: { pdfUrl, year } });

  revalidatePath("/pta"); 
  
  return NextResponse.json(doc, { status: 201 });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  await prisma.ptaDocument.deleteMany();

  revalidatePath("/pta");

  return NextResponse.json({ success: true });
}