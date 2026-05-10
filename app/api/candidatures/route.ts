import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 1. Initialize Upstash Ratelimit (10 apps / hour)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"),
});

// Zod Schema for validation
const candidatureSchema = z.object({
  opportunityId: z.string().min(1),
  fullName: z
    .string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères.")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom ne peut contenir que des lettres.")
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Veuillez saisir votre nom et votre prénom.",
    }),
  phone: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, ""))
    .pipe(
      z.string()
        .regex(/^01[0-9]{8}$/, "Le numéro doit comporter 10 chiffres et commencer par 01.")
    ),
  email: z
    .string()
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
  message: z
    .string()
    .max(1000, "Message trop long.")
    .optional()
    .or(z.null()),
  cvUrl: z.string().optional().or(z.null()),
});

// GET: Fetch applications (Protected)
export async function GET() {
  const { auth } = await import("@/auth");
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { opportunity: { select: { title: true, type: true } } },
  });
  
  return NextResponse.json(applications);
}

// POST: Submit a new application (Rate-limited)
export async function POST(req: Request) {
  try {
    // A. Rate Limit Check (First priority)
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Trop de soumissions. Réessayez plus tard." },
        { status: 429 }
      );
    }

    // B. Validate Data
    const body = await req.json();
    const result = candidatureSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // C. Create Database Entry
    const application = await prisma.application.create({
      data: {
        opportunityId: result.data.opportunityId,
        fullName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email || null,
        message: result.data.message || null,
        cvUrl: result.data.cvUrl || null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("APPLICATION_POST_ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}