import { notFound } from "next/navigation";
import OfferForm from "@/components/OfferForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const offer = await prisma.opportunity.findUnique({ where: { id } });
  if (!offer) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier l’offre</h1>
        <OfferForm
          id={id}
          initial={{
            type: offer.type,
            title: offer.title,
            description: offer.description,
            deadline: offer.deadline ? offer.deadline.toISOString().slice(0, 10) : "",
            isFree: offer.isFree,
            price: offer.price ? String(offer.price) : "",
            published: offer.published,
          }}
        />
      </div>
    </main>
  );
}
