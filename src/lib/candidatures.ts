import { z } from "zod";
import { BENIN_PHONE, normalizeBeninPhone } from "@/lib/phone";

export const candidatureSchema = z.object({
  opportunityId: z.string().min(1),
  // Names in Fon or Yoruba use letters such as ɛ, ɔ, ɖ and tone marks
  fullName: z
    .string()
    .transform((val) => val.normalize("NFC").trim().replace(/\s+/g, " "))
    .pipe(
      z
        .string()
        .min(3, "Le nom doit contenir au moins 3 caractères.")
        .max(100, "Le nom est trop long.")
        .regex(/^[\p{L}\p{M}'’ -]+$/u, "Le nom ne peut contenir que des lettres.")
        .refine((val) => val.split(" ").length >= 2, {
          message: "Veuillez saisir votre nom et votre prénom.",
        }),
    ),
  phone: z
    .string()
    .transform(normalizeBeninPhone)
    .pipe(
      z.string().regex(BENIN_PHONE, "Le numéro doit comporter 10 chiffres et commencer par 01."),
    ),
  email: z.string().email("Adresse email invalide.").optional().or(z.literal("")).or(z.null()),
  message: z
    .string()
    .max(1000, "Message trop long (1000 caractères au maximum).")
    .optional()
    .or(z.null()),
  consent: z.literal(true, { error: "Votre accord est nécessaire pour envoyer la candidature." }),
  files: z
    .array(z.string().regex(/^[0-9a-f-]{36}\.pdf$/, "Document invalide."))
    .max(5, "5 documents au maximum.")
    .default([]),
});

export const applicantSchema = candidatureSchema.pick({
  fullName: true,
  phone: true,
  email: true,
  message: true,
});
