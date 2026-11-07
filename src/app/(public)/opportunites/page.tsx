import type { Metadata } from "next";
import Link from "next/link";
import OpportunityCard from "@/components/OpportunityCard";
import PageHeader from "@/components/PageHeader";
import { openOpportunitiesWhere } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Opportunités",
  description: "Les offres d’emploi et les formations proposées par la Mairie des Jeunes de Zè.",
};

export default async function OpportunitiesPage() {
  const opportunities = await prisma.opportunity.findMany({
    where: openOpportunitiesWhere(),
    orderBy: { createdAt: "desc" },
  });

  const sections = [
    {
      title: "Formations",
      opportunities: opportunities.filter((opportunity) => opportunity.type === "TRAINING"),
    },
    {
      title: "Offres d’emploi",
      opportunities: opportunities.filter((opportunity) => opportunity.type === "JOB"),
    },
  ].filter((section) => section.opportunities.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <PageHeader
        title="Offres d’emploi et formations"
        subtitle="Opportunités disponibles pour la jeunesse de Zè"
      />

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:px-6">
        {sections.map((section, sectionIndex) => (
          <section key={section.title}>
            <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">{section.title}</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.opportunities.map((opportunity, index) => (
                <li key={opportunity.id}>
                  <OpportunityCard
                    opportunity={opportunity}
                    preload={sectionIndex === 0 && index === 0}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}

        {sections.length === 0 && (
          <p className="py-12 text-center text-gray-600">
            Aucune offre pour le moment. Revenez bientôt.
          </p>
        )}

        <Link href="/" className="inline-block text-sm text-gray-600 hover:text-gray-900">
          ← Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}
