import "server-only";
import { isProjectFile } from "@/lib/storage";
import { focusValue, z } from "@/lib/zod";

// A deadline is midnight UTC of the chosen day, and that day ends 23 hours later in Benin (UTC+1)
const DAY_END_MS = 23 * 60 * 60 * 1000;

export function isOpen(deadline: Date | null) {
  return !deadline || deadline.getTime() + DAY_END_MS > Date.now();
}

export function openOpportunitiesWhere() {
  return {
    published: true,
    OR: [{ deadline: null }, { deadline: { gt: new Date(Date.now() - DAY_END_MS) } }],
  };
}

export const opportunitySchema = z
  .object({
    type: z.enum(["JOB", "TRAINING"]),
    title: z.string().trim().min(3, "Titre trop court.").max(200, "Titre trop long."),
    description: z.string().trim().max(5000, "Description trop longue."),
    deadline: z.iso.datetime().nullable(),
    isFree: z.boolean(),
    price: z
      .number()
      .int("Le prix doit être un nombre entier.")
      .positive("Le prix doit être positif.")
      .nullable(),
    imageUrl: z
      .string()
      .refine((url) => url === "" || isProjectFile(url, "photos"), "Affiche invalide.")
      .nullish(),
    imageFocusX: focusValue.default(50),
    imageFocusY: focusValue.default(0),
    published: z.boolean().default(false),
  })
  .refine((opportunity) => opportunity.isFree || opportunity.price !== null, {
    message: "Indiquez le prix d’une offre payante.",
    path: ["price"],
  })
  .transform((opportunity) => ({
    ...opportunity,
    price: opportunity.isFree ? null : opportunity.price,
    imageUrl: opportunity.imageUrl || null,
  }));
