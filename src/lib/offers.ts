import "server-only";
import { z } from "zod";
import { isProjectFile } from "@/lib/storage";

// A deadline is midnight UTC of the chosen day, and that day ends 23 hours later in Benin (UTC+1)
const DAY_END_MS = 23 * 60 * 60 * 1000;

export function isOpen(deadline: Date | null) {
  return !deadline || deadline.getTime() + DAY_END_MS > Date.now();
}

export function openOffersWhere() {
  return {
    published: true,
    OR: [{ deadline: null }, { deadline: { gt: new Date(Date.now() - DAY_END_MS) } }],
  };
}

export const offerSchema = z
  .object({
    type: z.enum(["JOB", "TRAINING"]),
    title: z.string().trim().min(3, "Titre trop court.").max(200, "Titre trop long."),
    description: z.string().trim().max(5000, "Description trop longue."),
    deadline: z.iso.datetime().nullable(),
    isFree: z.boolean(),
    price: z.number().positive("Le prix doit être positif.").nullable(),
    imageUrl: z
      .string()
      .refine((url) => url === "" || isProjectFile(url, "photos"), "Affiche invalide.")
      .nullish(),
    published: z.boolean().default(false),
  })
  .refine((o) => o.isFree || o.price !== null, {
    message: "Indiquez le prix d'une offre payante.",
    path: ["price"],
  })
  .transform((o) => ({ ...o, price: o.isFree ? null : o.price, imageUrl: o.imageUrl || null }));
