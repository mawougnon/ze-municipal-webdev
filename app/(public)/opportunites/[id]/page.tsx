import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationForm from "@/components/ApplicationForm";
import { isOpen } from "@/lib/offers";

export default async function OpportuniteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await prisma.opportunity.findUnique({
    where: { id, published: true },
  });

  if (!opportunity) notFound();

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-700 px-6 py-12 text-center text-white">
        <span
          className={`mb-4 inline-block rounded-full px-3 py-1 text-xs ${
            opportunity.type === "JOB" ? "bg-blue-500" : "bg-purple-500"
          }`}
        >
          {opportunity.type === "JOB" ? "Offre d'emploi" : "Formation"}
        </span>
        <h1 className="mt-2 text-3xl font-bold">{opportunity.title}</h1>
        <p className="mt-2 font-semibold text-green-100">
          {opportunity.isFree ? "Gratuit" : `${formatPrice(opportunity.price)} XOF`}
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-10 rounded-xl border border-gray-100 bg-gray-50 p-6">
          <h2 className="mb-3 font-semibold text-gray-800">Description</h2>
          <p className="whitespace-pre-line text-gray-600">{opportunity.description}</p>
          {opportunity.deadline && (
            <p className="mt-4 text-sm font-medium text-red-500">
              ⏳ Date limite : {formatDate(opportunity.deadline)}
            </p>
          )}
        </div>

        {/* A shared link can outlive the deadline: no form once the offer is closed */}
        {isOpen(opportunity.deadline) ? (
          <ApplicationForm
            opportunityId={opportunity.id}
            isFree={opportunity.isFree}
            price={opportunity.price}
            type={opportunity.type}
          />
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            Les candidatures pour cette offre sont closes.
          </div>
        )}

        <div className="mt-8">
          <Link href="/opportunites" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour aux offres
          </Link>
        </div>
      </section>
    </main>
  );
}
