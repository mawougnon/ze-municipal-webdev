import AdminList, { Badge, PublishedBadge } from "@/components/AdminList";
import { requireAdmin } from "@/lib/admin";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminOpportunitiesPage() {
  await requireAdmin();

  const opportunities = await prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminList
      title="Offres d’emploi et formations"
      basePath="/admin/opportunites"
      newLabel="Nouvelle offre"
      emptyLabel="Aucune offre pour le moment."
      items={opportunities.map((opportunity) => ({
        id: opportunity.id,
        title: opportunity.title,
        details: (
          <>
            <PublishedBadge published={opportunity.published} />
            {opportunity.type === "JOB" ? (
              <Badge className="bg-blue-100 text-blue-700">Emploi</Badge>
            ) : (
              <Badge className="bg-purple-100 text-purple-700">Formation</Badge>
            )}
            {opportunity.isFree ? (
              <Badge className="bg-green-100 text-green-700">Gratuit</Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-700">
                {formatPrice(opportunity.price)} XOF
              </Badge>
            )}
          </>
        ),
      }))}
    />
  );
}
