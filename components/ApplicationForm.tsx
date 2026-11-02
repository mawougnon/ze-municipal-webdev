"use client";

import { formatPrice } from "@/lib/format";
import { useState } from "react";
import { z } from "zod";
import { BENIN_PHONE, normalizeBeninPhone } from "@/lib/phone";
import { safeFileName } from "@/lib/storage";

interface Props {
  opportunityId: string;
  isFree: boolean;
  price: number | null;
  type: string;
}

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Le nom doit contenir au moins 3 caractères.")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "Le nom ne peut contenir que des lettres.")
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Veuillez saisir votre nom et votre prénom.",
    }),

  phone: z
    .string()
    .transform(normalizeBeninPhone)
    .pipe(
      z.string().regex(BENIN_PHONE, "Le numéro doit comporter 10 chiffres et commencer par 01."),
    ),

  email: z.string().email("Adresse email invalide.").optional().or(z.literal("")),

  message: z.string().max(1000, "Message trop long (max 1000 caractères).").optional(),
});

type FormData = z.infer<typeof schema>;

export default function ApplicationForm({ opportunityId, isFree, price, type }: Props) {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [wantsToUploadCV, setWantsToUploadCV] = useState(false);
  const [cvFiles, setCvFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // Validate a single field on blur
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[name as keyof FormData];
      if (fieldError) setErrors((prev) => ({ ...prev, [name]: fieldError[0] }));
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Max 5 files, max 5MB each
    if (files.length > 5) {
      setServerError("Maximum 5 fichiers autorisés.");
      return;
    }
    for (const file of files) {
      // The documents bucket only accepts PDF: say it here instead of failing later
      if (file.type !== "application/pdf") {
        setServerError(`"${file.name}" n'est pas un PDF. Seuls les fichiers PDF sont acceptés.`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setServerError(`Le fichier "${file.name}" dépasse 5 Mo.`);
        return;
      }
    }
    setServerError("");

    setUploading(true);
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const filename = `cv-${Date.now()}-${safeFileName(file.name)}`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(filename, file, { upsert: false });

        if (error) throw error;
        const { data } = supabase.storage.from("documents").getPublicUrl(filename);
        uploaded.push(data.publicUrl);
      } catch {
        failed.push(file.name);
      }
    }

    // A failed upload used to vanish silently: the applicant must know before sending
    if (failed.length > 0) {
      setServerError(`Échec de l'envoi de : ${failed.join(", ")}. Réessayez.`);
    }
    setCvFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        fullName: fieldErrors.fullName?.[0],
        phone: fieldErrors.phone?.[0],
        email: fieldErrors.email?.[0],
        message: fieldErrors.message?.[0],
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          opportunityId,
          cvUrl: cvFiles.length > 0 ? cvFiles.join(" | ") : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.details) {
          setErrors({
            fullName: data.details.fullName?.[0],
            phone: data.details.phone?.[0],
            email: data.details.email?.[0],
            message: data.details.message?.[0],
          });
          setLoading(false);
          return;
        }
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setSuccess(true);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Une erreur est survenue. Veuillez réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-700">✅ Candidature reçue !</p>

        {/* Payment message: only shown for paid opportunities */}
        {!isFree && (
          <p className="mt-3 leading-relaxed text-gray-600">
            Pour finaliser votre candidature, nos services vous contacteront dans les plus brefs
            délais via WhatsApp pour vous accompagner dans la procédure de règlement.
          </p>
        )}

        <p className="mt-3 text-sm text-gray-400">Merci de votre intérêt pour cette opportunité.</p>
      </div>
    );
  }
  const uploadSection = (label: string) => (
    <div className="rounded-lg border border-dashed border-gray-200 p-4">
      <label className="mb-3 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={wantsToUploadCV}
          onChange={(e) => setWantsToUploadCV(e.target.checked)}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>

      {wantsToUploadCV && (
        <div>
          <p className="mb-2 text-sm text-gray-500">
            Format accepté : PDF uniquement (5 fichiers au maximum, 5 Mo chacun)
          </p>
          <input
            type="file"
            multiple
            accept="application/pdf,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-700 hover:file:bg-green-100"
          />
          {uploading && <p className="mt-2 text-sm text-gray-400">Envoi en cours...</p>}
          {cvFiles.map((_, i) => (
            <p key={i} className="mt-1 text-sm text-green-600">
              ✅ Fichier {i + 1} uploadé
            </p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-bold text-gray-800">
        {isFree ? "Postuler gratuitement" : `Postuler (${formatPrice(price)} XOF)`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Full name: letters only */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            required
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.fullName ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        {/* WhatsApp: Benin format */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Numéro WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            required
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="01 XX XX XX XX"
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.phone ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        {/* Email: optional */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Adresse email (optionnel)
          </label>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.email ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Message: optional */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Message de motivation (optionnel)
          </label>
          <textarea
            name="message"
            rows={3}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.message ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>

        {/* File upload: optional, toggled */}
        {type === "JOB" &&
          uploadSection("Je souhaite joindre des documents (CV, lettre de motivation...)")}
        {type === "TRAINING" &&
          uploadSection("Je souhaite joindre des documents (attestations, diplômes...)")}

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
        </button>
      </form>
    </div>
  );
}
