import { z } from "zod";

// A deadline is stored as midnight UTC of the chosen day. Benin is UTC+1 all year,
// so that day ends 23 hours later: an offer stays open for the whole deadline day.
const DAY_END_MS = 23 * 60 * 60 * 1000;

export function isOpen(deadline: Date | null) {
  return !deadline || deadline.getTime() + DAY_END_MS > Date.now();
}

// Prisma filter for offers that are published and still open
export function openOffersWhere() {
  return {
    published: true,
    OR: [{ deadline: null }, { deadline: { gt: new Date(Date.now() - DAY_END_MS) } }],
  };
}

// What an admin may send when creating or editing an offer
export const offerSchema = z
  .object({
    type: z.enum(["JOB", "TRAINING"]),
    title: z.string().trim().min(3, "Titre trop court.").max(200, "Titre trop long."),
    description: z.string().trim().max(5000, "Description trop longue."),
    deadline: z.iso.datetime().nullable(),
    isFree: z.boolean(),
    price: z.number().positive("Le prix doit être positif.").nullable(),
    published: z.boolean().default(false),
  })
  .refine((o) => o.isFree || o.price !== null, { message: "Indiquez le prix d'une offre payante.", path: ["price"] })
  .transform((o) => ({ ...o, price: o.isFree ? null : o.price }));
