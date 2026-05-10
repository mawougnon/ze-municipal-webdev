import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(opportunities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { type, title, description, deadline, isFree, price, published } = await req.json();
  
  const opportunity = await prisma.opportunity.create({ 
    data: { 
      type, 
      title, 
      description, 
      deadline, 
      isFree, 
      price, 
      published: published || false
    } 
  });

  revalidatePath("/opportunites");
  revalidatePath("/"); 

  return NextResponse.json(opportunity, { status: 201 });
}