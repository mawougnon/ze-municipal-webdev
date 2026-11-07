import type { MetadataRoute } from "next";
import { openOffersWhere } from "@/lib/offers";
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
  const [articles, offers] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
    }),
    prisma.opportunity.findMany({ where: openOffersWhere(), select: { id: true } }),
  ]);

  return [
    ...PAGES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...articles.map((a) => ({ url: `${SITE_URL}/articles/${a.id}`, lastModified: a.updatedAt })),
    ...offers.map((o) => ({ url: `${SITE_URL}/opportunites/${o.id}` })),
  ];
}
