import { z } from "zod";
import { isProjectFile } from "@/lib/storage";

// What an admin may send when creating or editing an article
export const articleSchema = z.object({
  title: z.string().trim().min(3, "Titre trop court.").max(300, "Titre trop long."),
  content: z.string().min(1, "Le contenu est obligatoire.").max(100_000, "Contenu trop long."),
  coverImageUrl: z
    .string()
    .refine((url) => url === "" || isProjectFile(url, "photos"), "Image de couverture invalide.")
    .nullish(),
  published: z.boolean().default(false),
});
