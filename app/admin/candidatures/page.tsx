import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CandidatureCard from "@/components/CandidatureCard";

interface Props {
  searchParams: Promise<{ type?: string; opportunityId?: string }>;
}

export default async function CandidaturesPage({ searchParams }: Props) {
  const { type, opportunityId } = await searchParams;

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(opportunityId ? { opportunityId } : {}),
      ...(type ? { opportunity: { type } } : {}),
    },
    include: { opportunity: { select: { title: true, type: true } } },
  });

  const opportunities = await prisma.opportunity.findMany({
    select: { id: true, title: true, type: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Candidatures reçues</h1>
          <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
            {applications.length} candidature(s)
          </span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Type d'offre
            </label>
            <div className="flex gap-2">
              {[
                { label: "Toutes", value: "" },
                { label: "Emploi", value: "JOB" },
                { label: "Formation", value: "TRAINING" },
              ].map((f) => (
                <Link
                  key={f.value}
                  href={`/admin/candidatures?type=${f.value}${opportunityId ? `&opportunityId=${opportunityId}` : ""}`}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    (type || "") === f.value
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Filtrer par offre
            </label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/candidatures${type ? `?type=${type}` : ""}`}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                  !opportunityId
                    ? "bg-green-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Toutes les offres
              </Link>
              {opportunities.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/candidatures?opportunityId=${o.id}${type ? `&type=${type}` : ""}`}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    opportunityId === o.id
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {o.title}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Applications list */}
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-400">
            Aucune candidature pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((a) => (
              <CandidatureCard key={a.id} a={a} />
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}