import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isProjectFile } from "@/lib/storage";

export const documentSchema = z
  .object({
    title: z.string().trim().min(3, "Titre trop court.").max(200, "Titre trop long."),
    description: z
      .string()
      .trim()
      .min(1, "La description est obligatoire.")
      .max(2000, "Description trop longue."),
    fileUrl: z.string().refine((url) => isProjectFile(url, "documents"), "Joignez le fichier PDF."),
    date: z.iso.date("Date invalide."),
    featured: z.boolean().default(false),
    published: z.boolean().default(false),
  })
  .transform((document) => ({ ...document, date: new Date(`${document.date}T00:00:00.000Z`) }));

export async function publishedDocuments() {
  const documents = await prisma.document.findMany({
    where: { published: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  const featured = documents.find((document) => document.featured);
  return { featured, others: documents.filter((document) => document !== featured) };
}
