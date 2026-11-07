import Link from "next/link";
import AdminBackLink from "@/components/AdminBackLink";
import ApplicationCard from "@/components/ApplicationCard";
import { requireAdmin } from "@/lib/admin";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ type?: string; opportunityId?: string }>;
}

export default async function AdminApplicationsPage({ searchParams }: Props) {
  await requireAdmin();

  const { type, opportunityId } = await searchParams;

  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(opportunityId ? { opportunityId } : {}),
      ...(type === "JOB" || type === "TRAINING" ? { opportunity: { type } } : {}),
    },
    include: { files: true, opportunity: { select: { title: true, type: true } } },
  });

  const opportunities = await prisma.opportunity.findMany({
    select: { id: true, title: true, type: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <AdminBackLink />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Candidatures reçues</h1>
          <span className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700">
            {plural(applications.length, "candidature")}
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
              ].map((option) => (
                <Link
                  key={option.value}
                  href={`/admin/candidatures?type=${option.value}${opportunityId ? `&opportunityId=${opportunityId}` : ""}`}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                    (type || "") === option.value
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
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
              {opportunities.map((opportunity) => (
                <Link
                  key={opportunity.id}
                  href={`/admin/candidatures?opportunityId=${opportunity.id}${type ? `&type=${type}` : ""}`}
                  className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
                    opportunityId === opportunity.id
                      ? "bg-green-700 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opportunity.title}
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
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
