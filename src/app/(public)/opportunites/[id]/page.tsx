import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import ApplicationForm from "@/components/ApplicationForm";
import { formatDate, formatPrice, LONG_DATE } from "@/lib/format";
import { isOpen } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

const getOpportunity = cache((id: string) =>
  prisma.opportunity.findUnique({ where: { id, published: true } }),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const opportunity = await getOpportunity((await params).id);
  if (!opportunity) return {};
  const description = opportunity.description.replace(/\s+/g, " ").slice(0, 160);
  return {
    title: opportunity.title,
    description,
    openGraph: {
      title: opportunity.title,
      description,
      ...(opportunity.imageUrl ? { images: [opportunity.imageUrl] } : {}),
    },
  };
}

export default async function OpportunityPage({ params }: Props) {
  const opportunity = await getOpportunity((await params).id);

  if (!opportunity) notFound();

  const open = isOpen(opportunity.deadline);
  const paragraphs = opportunity.description.split("\n").filter((line) => line.trim());

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-green-900 py-10 text-white">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Link href="/opportunites" className="text-sm text-green-100 hover:text-white">
            ← Toutes les offres
          </Link>
          <p className="mt-5 text-xs font-bold tracking-widest text-gold-light uppercase">
            {opportunity.type === "JOB" ? "Offre d’emploi" : "Formation"}
          </p>
          <h1 className="mt-2 font-serif text-2xl leading-tight font-bold break-words md:text-4xl">
            {opportunity.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 lg:py-12">
        <aside className="lg:order-2">
          <div className="rounded-xl border border-gray-200 bg-cream p-6 lg:sticky lg:top-24">
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
                  Prix
                </dt>
                <dd className="mt-1 text-2xl font-bold text-green-800">
                  {opportunity.isFree ? "Gratuit" : `${formatPrice(opportunity.price)} XOF`}
                </dd>
              </div>
              {opportunity.deadline && (
                <div>
                  <dt className="text-xs font-semibold tracking-widest text-gray-600 uppercase">
                    Date limite
                  </dt>
                  <dd className="mt-1 font-semibold text-gray-900">
                    {formatDate(opportunity.deadline, LONG_DATE)}
                  </dd>
                </div>
              )}
            </dl>
            {open ? (
              <a
                href="#postuler"
                className="mt-6 block rounded-lg bg-green-700 py-3 text-center font-semibold text-white transition hover:bg-green-800"
              >
                Postuler
              </a>
            ) : (
              <p className="mt-6 rounded-lg bg-gray-200 py-3 text-center font-semibold text-gray-800">
                Candidatures closes
              </p>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-10 lg:order-1">
          {opportunity.imageUrl && (
            <Image
              src={opportunity.imageUrl}
              alt={`Affiche : ${opportunity.title}`}
              width={1200}
              height={800}
              sizes="(max-width: 1024px) 100vw, 780px"
              className="mx-auto h-auto max-h-[85vh] w-auto max-w-full rounded-xl"
              preload
            />
          )}

          <section>
            <h2 className="font-serif text-2xl font-bold text-gray-900">Description</h2>
            <div className="mt-4 space-y-3 leading-relaxed break-words text-gray-700">
              {paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {open && (
            <section id="postuler" className="scroll-mt-24">
              <ApplicationForm
                opportunityId={opportunity.id}
                isFree={opportunity.isFree}
                price={opportunity.price}
                type={opportunity.type}
              />
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
