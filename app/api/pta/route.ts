import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache"; // 1. Import indispensable

export async function GET() {
  const activities = await prisma.ptaActivity.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { year, title, description, status } = await req.json();
  
  const activity = await prisma.ptaActivity.create({ 
    data: { year, title, description, status } 
  });

  revalidatePath("/pta");
  revalidatePath("/");

  return NextResponse.json(activity, { status: 201 });
}