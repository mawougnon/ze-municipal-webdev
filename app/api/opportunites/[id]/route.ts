import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; 

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  const { type, title, description, deadline, published, isFree, price } = await req.json();
  
  try {
    const opportunity = await prisma.opportunity.update({ 
      where: { id }, 
      data: { type, title, description, deadline, published, isFree, price } 
    });

    revalidatePath("/opportunites");
    revalidatePath("/"); 

    return NextResponse.json(opportunity);
  } catch { 
    return NextResponse.json({ error: "Not found" }, { status: 404 }); 
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { id } = await params;
  
  try {
    await prisma.opportunity.delete({ where: { id } });

    // 3. Mise à jour du cache après suppression
    revalidatePath("/opportunites");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch { 
    return NextResponse.json({ error: "Not found" }, { status: 404 }); 
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  
  if (!opportunity) return NextResponse.json({ error: "Not found" }, { status: 404 });
  
  return NextResponse.json(opportunity);
}