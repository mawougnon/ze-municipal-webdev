import * as z from "zod/mini";
import { BENIN_PHONE, normalizeBeninPhone } from "@/lib/phone";

// Visitors download this schema with the form, hence zod/mini. See lib/zod.ts for the setting
z.config({ jitless: true });

export const applicationSchema = z.object({
  opportunityId: z.string().check(z.minLength(1)),
  // Names in Fon or Yoruba use letters such as ɛ, ɔ, ɖ and tone marks
  fullName: z.pipe(
    z.pipe(
      z.string(),
      z.transform((val) => val.normalize("NFC").trim().replace(/\s+/g, " ")),
    ),
    z.string().check(
      z.minLength(3, "Le nom doit contenir au moins 3 caractères."),
      z.maxLength(100, "Le nom est trop long."),
      z.regex(/^[\p{L}\p{M}'’ -]+$/u, "Le nom ne peut contenir que des lettres."),
      z.refine((val) => val.split(" ").length >= 2, {
        error: "Veuillez saisir votre nom et votre prénom.",
      }),
    ),
  ),
  phone: z.pipe(
    z.pipe(z.string(), z.transform(normalizeBeninPhone)),
    z
      .string()
      .check(z.regex(BENIN_PHONE, "Le numéro doit comporter 10 chiffres et commencer par 01.")),
  ),
  email: z.optional(z.union([z.email("Adresse email invalide."), z.literal(""), z.null()])),
  message: z.optional(
    z.nullable(
      z.string().check(z.maxLength(1000, "Message trop long (1000 caractères au maximum).")),
    ),
  ),
  consent: z.literal(true, { error: "Votre accord est nécessaire pour envoyer la candidature." }),
  files: z._default(
    z
      .array(z.string().check(z.regex(/^[0-9a-f-]{36}\.pdf$/, "Document invalide.")))
      .check(z.maxLength(5, "5 documents au maximum.")),
    [],
  ),
});

export const applicantSchema = z.pick(applicationSchema, {
  fullName: true,
  phone: true,
  email: true,
  message: true,
});
