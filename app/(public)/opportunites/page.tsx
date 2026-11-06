import type { Metadata } from "next";
import Link from "next/link";
import OfferCard from "@/components/OfferCard";
import { openOffersWhere } from "@/lib/offers";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Opportunités",
  description: "Les offres d’emploi et les formations proposées par la Mairie des Jeunes de Zè.",
};

export default async function OpportunitesPublicPage() {
  const offers = await prisma.opportunity.findMany({
    where: openOffersWhere(),
    orderBy: { createdAt: "desc" },
  });

  const sections = [
    { title: "Formations", offers: offers.filter((o) => o.type === "TRAINING") },
    { title: "Offres d’emploi", offers: offers.filter((o) => o.type === "JOB") },
  ].filter((section) => section.offers.length > 0);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-900 px-4 py-12 text-center text-white md:px-6">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Offres d’emploi & Formations</h1>
        <p className="mt-2 text-green-100">Opportunités disponibles pour la jeunesse de Zè</p>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12 md:px-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-6 font-serif text-2xl font-bold text-gray-900">{section.title}</h2>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.offers.map((offer) => (
                <li key={offer.id}>
                  <OfferCard offer={offer} />
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
