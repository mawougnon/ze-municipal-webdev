import { z } from "@/lib/zod";

export const ROLE_LABELS = {
  ADMIN: "Administrateur",
  SUPERADMIN: "Administrateur principal",
} as const;

export const roleSchema = z.enum(["ADMIN", "SUPERADMIN"], { error: "Rôle invalide." });

export const accountSchema = z.object({
  name: z
    .string({ error: "Indiquez le nom." })
    .trim()
    .min(2, "Indiquez le nom.")
    .max(100, "Nom trop long."),
  // Must match normalizeEmail in lib/login.ts
  email: z
    .string({ error: "Adresse email invalide." })
    .trim()
    .toLowerCase()
    .max(254, "Adresse email invalide.")
    .pipe(z.email("Adresse email invalide.")),
  role: roleSchema,
});
