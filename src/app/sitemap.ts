import type { MetadataRoute } from "next";
import { openOpportunitiesWhere } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// The build must not need the database
export const dynamic = "force-dynamic";

const PAGES = [
  "",
  "/articles",
  "/documents",
  "/presentation",
  "/opportunites",
  "/contact",
  "/mentions-legales",
  "/confidentialite",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, opportunities] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.opportunity.findMany({ where: openOpportunitiesWhere(), select: { id: true } }),
  ]);

  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/articles/${article.id}`,
      lastModified: article.updatedAt,
    })),
    ...opportunities.map((opportunity) => ({ url: `${SITE_URL}/opportunites/${opportunity.id}` })),
  ];
}
