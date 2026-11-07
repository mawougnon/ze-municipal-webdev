import AdminList, { PublishedBadge } from "@/components/AdminList";
import { requireAdmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminArticlesPage() {
  await requireAdmin();

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminList
      title="Articles"
      basePath="/admin/articles"
      newLabel="Nouvel article"
      emptyLabel="Aucun article pour le moment."
      items={articles.map((article) => ({
        id: article.id,
        title: article.title,
        details: (
          <>
            <PublishedBadge published={article.published} />
            <span className="text-gray-500">{formatDate(article.createdAt)}</span>
          </>
        ),
      }))}
    />
  );
}
