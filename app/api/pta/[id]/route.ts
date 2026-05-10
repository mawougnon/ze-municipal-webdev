import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  const { year, title, description, status } = await req.json();
  
  try {
    const activity = await prisma.ptaActivity.update({ 
      where: { id }, 
      data: { year, title, description, status } 
    });

    revalidatePath("/pta");
    revalidatePath("/");

    return NextResponse.json(activity);
  } catch { 
    return NextResponse.json({ error: "Not found" }, { status: 404 }); 
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  
  try {
    await prisma.ptaActivity.delete({ where: { id } });

    // Mise à jour du cache après suppression
    revalidatePath("/pta");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch { 
    return NextResponse.json({ error: "Not found" }, { status: 404 }); 
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await prisma.ptaActivity.findUnique({ where: { id } });
  
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json(activity);
}