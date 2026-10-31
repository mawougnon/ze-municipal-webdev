import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { offerSchema } from "@/lib/offers";

export async function GET() {
  // Unpublished offers are only returned to a logged-in admin
  const session = await auth();
  const opportunities = await prisma.opportunity.findMany({
    where: session ? undefined : { published: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(opportunities);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  
  const result = offerSchema.safeParse(await req.json().catch(() => null));
  if (!result.success) return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });

  const opportunity = await prisma.opportunity.create({ data: result.data });

  revalidatePath("/opportunites");
  revalidatePath("/"); 

  return NextResponse.json(opportunity, { status: 201 });
}