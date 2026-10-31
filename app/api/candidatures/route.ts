import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isOpen } from "@/lib/offers";

// Limits counted in the database (no external service)
const MAX_PER_PHONE_PER_HOUR = 3;
const MAX_TOTAL_PER_HOUR = 100;

// Uploaded documents live in the project's "documents" bucket. Any other link is refused,
// so an applicant cannot plant a link to an outside page in the admin panel.
const DOCUMENTS_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/`;
const isOwnDocument = (url: string) => {
  const name = url.slice(DOCUMENTS_PREFIX.length);
  return url.startsWith(DOCUMENTS_PREFIX) && name.length > 0 && !name.includes("/") && !name.includes("..");
};

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
  cvUrl: z
    .string()
    .optional()
    .or(z.null())
    .refine((val) => {
      if (!val) return true;
      const urls = val.split(" | ");
      return urls.length <= 5 && urls.every(isOwnDocument);
    }, "Document invalide."),
});

// GET: Fetch applications (Protected)
export async function GET() {
  const { auth } = await import("@/auth");
  const session = await auth();
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
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
    // A. Validate Data
    const body = await req.json();
    const result = candidatureSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // B. The offer must exist, be published and still be open
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: result.data.opportunityId },
      select: { published: true, deadline: true },
    });
    if (!opportunity || !opportunity.published) {
      return NextResponse.json({ error: "Offre introuvable." }, { status: 404 });
    }
    if (!isOpen(opportunity.deadline)) {
      return NextResponse.json({ error: "Les candidatures pour cette offre sont closes." }, { status: 410 });
    }

    // C. Rate limit, by phone number and overall
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [byPhone, total] = await Promise.all([
      prisma.application.count({ where: { phone: result.data.phone, createdAt: { gte: hourAgo } } }),
      prisma.application.count({ where: { createdAt: { gte: hourAgo } } }),
    ]);

    if (byPhone >= MAX_PER_PHONE_PER_HOUR || total >= MAX_TOTAL_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop de soumissions. Réessayez plus tard." },
        { status: 429 }
      );
    }

    // D. Create Database Entry
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