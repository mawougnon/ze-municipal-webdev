import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CandidatureCard from "@/components/CandidatureCard";

interface Props {
  searchParams: Promise<{ type?: string; opportunityId?: string }>;
}

export default async function CandidaturesPage({ searchParams }: Props) {
  await requireAdmin();

  const { type, opportunityId } = await searchParams;

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(opportunityId ? { opportunityId } : {}),
      ...(type ? { opportunity: { type } } : {}),
    },
    include: { files: true, opportunity: { select: { title: true, type: true } } },
  });

  const opportunities = await prisma.opportunity.findMany({
    select: { id: true, title: true, type: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Candidatures reçues</h1>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700">
            {applications.length} candidature(s)
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Type d’offre</label>
            <div className="flex gap-2">
              {[
                { label: "Toutes", value: "" },
                { label: "Emploi", value: "JOB" },
                { label: "Formation", value: "TRAINING" },
              ].map((f) => (
                <Link
                  key={f.value}
                  href={`/admin/candidatures?type=${f.value}${opportunityId ? `&opportunityId=${opportunityId}` : ""}`}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
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
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Filtrer par offre
            </label>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/candidatures${type ? `?type=${type}` : ""}`}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
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
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
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

        {applications.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
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
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-600">
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    </main>
  );
}
