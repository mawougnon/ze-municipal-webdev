import Link from "next/link";
import AdminBackLink from "@/components/AdminBackLink";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AdminOpportunitiesPage() {
  await requireAdmin();

  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <AdminBackLink />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Offres d’emploi et formations</h1>
          <Link
            href="/admin/opportunites/nouveau"
            className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
          >
            + Nouvelle offre
          </Link>
        </div>

        {opportunities.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">
            Aucune offre pour le moment.
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{opportunity.title}</h2>
                  <div className="mt-1 flex gap-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${opportunity.type === "JOB" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
                    >
                      {opportunity.type === "JOB" ? "Emploi" : "Formation"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${opportunity.isFree ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                    >
                      {opportunity.isFree ? "Gratuit" : `${opportunity.price} XOF`}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${opportunity.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {opportunity.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/opportunites/${opportunity.id}`}
                  className="text-sm text-green-800 hover:underline"
                >
                  Modifier
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
