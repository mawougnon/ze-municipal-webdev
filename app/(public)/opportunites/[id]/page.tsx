import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";

export default async function OpportuniteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id, published: true },
  });

  if (!opportunity) notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 text-white py-12 px-6 text-center">
        <span className={`text-xs px-3 py-1 rounded-full mb-4 inline-block ${
          opportunity.type === "JOB" ? "bg-blue-500" : "bg-purple-500"
        }`}>
          {opportunity.type === "JOB" ? "Offre d'emploi" : "Formation"}
        </span>
        <h1 className="text-3xl font-bold mt-2">{opportunity.title}</h1>
        <p className="text-green-100 mt-2 font-semibold">
          {opportunity.isFree ? "Gratuit" : `${opportunity.price} XOF`}
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 mb-10">
          <h2 className="font-semibold text-gray-800 mb-3">Description</h2>
          <p className="text-gray-600">{opportunity.description}</p>
          {opportunity.deadline && (
            <p className="text-red-500 text-sm mt-4 font-medium">
              ⏳ Date limite : {new Date(opportunity.deadline).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>

        {/* Application form component */}
        
        <ApplicationForm
          opportunityId={opportunity.id}
          isFree={opportunity.isFree}
          price={opportunity.price}
          type={opportunity.type}
        />

        <div className="mt-8">
          <Link href="/opportunites" className="text-gray-400 hover:text-gray-600 text-sm">← Retour aux offres</Link>
        </div>
      </section>
    </main>
  );
}