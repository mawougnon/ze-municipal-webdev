import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { isOpen } from "@/lib/offers";
import { candidatureSchema } from "@/lib/candidatures";

// Limits counted in the database (no external service)
const MAX_PER_PHONE_PER_HOUR = 3;
const MAX_TOTAL_PER_HOUR = 100;

class UnknownFileError extends Error {}

// POST: Submit a new application (Rate-limited)
export async function POST(req: Request) {
  try {
    // A. Validate Data
    const body = await req.json();
    const result = candidatureSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: result.error.flatten().fieldErrors },
        { status: 400 },
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
      return NextResponse.json(
        { error: "Les candidatures pour cette offre sont closes." },
        { status: 410 },
      );
    }

    // C. Rate limit, by phone number and overall
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const [byPhone, total] = await Promise.all([
      prisma.application.count({
        where: { phone: result.data.phone, createdAt: { gte: hourAgo } },
      }),
      prisma.application.count({ where: { createdAt: { gte: hourAgo } } }),
    ]);

    if (byPhone >= MAX_PER_PHONE_PER_HOUR || total >= MAX_TOTAL_PER_HOUR) {
      return NextResponse.json(
        { error: "Trop de soumissions. Réessayez plus tard." },
        { status: 429 },
      );
    }

    // D. Save the application and attach its documents. A document already attached, or
    // never issued, cancels everything.
    const { files } = result.data;
    const attached = await prisma
      .$transaction(async (tx) => {
        const application = await tx.application.create({
          data: {
            opportunityId: result.data.opportunityId,
            fullName: result.data.fullName,
            phone: result.data.phone,
            email: result.data.email || null,
            message: result.data.message || null,
          },
        });
        const { count } = await tx.applicationFile.updateMany({
          where: { path: { in: files }, applicationId: null },
          data: { applicationId: application.id },
        });
        if (count !== files.length) throw new UnknownFileError();
        return true;
      })
      .catch((error) => {
        if (error instanceof UnknownFileError) return false;
        throw error;
      });

    if (!attached) {
      return NextResponse.json({ error: "Document invalide." }, { status: 400 });
    }
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("APPLICATION_POST_ERROR:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
