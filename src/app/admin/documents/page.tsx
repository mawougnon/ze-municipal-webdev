import AdminList, { Badge, PublishedBadge } from "@/components/AdminList";
import { requireAdmin } from "@/lib/admin";
import { LONG_DATE, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminDocumentsPage() {
  await requireAdmin();

  const documents = await prisma.document.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return (
    <AdminList
      title="Documents"
      basePath="/admin/documents"
      newLabel="Nouveau document"
      emptyLabel="Aucun document pour le moment."
      items={documents.map((document) => ({
        id: document.id,
        title: document.title,
        details: (
          <>
            <PublishedBadge published={document.published} />
            {document.featured && <Badge className="bg-amber-100 text-amber-800">À la une</Badge>}
            <span className="text-gray-500">{formatDate(document.date, LONG_DATE)}</span>
          </>
        ),
      }))}
    />
  );
}
