import { notFound } from "next/navigation";
import OpportunityForm from "@/components/OpportunityForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditOpportunityPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({ where: { id } });
  if (!opportunity) notFound();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier l’offre</h1>
        <OpportunityForm
          id={id}
          initial={{
            type: opportunity.type,
            title: opportunity.title,
            description: opportunity.description,
            deadline: opportunity.deadline ? opportunity.deadline.toISOString().slice(0, 10) : "",
            isFree: opportunity.isFree,
            price: opportunity.price ? String(opportunity.price) : "",
            imageUrl: opportunity.imageUrl ?? "",
            imageFocusX: opportunity.imageFocusX,
            imageFocusY: opportunity.imageFocusY,
            published: opportunity.published,
          }}
        />
      </div>
    </main>
  );
}
