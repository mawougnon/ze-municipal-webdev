"use client";

import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useState } from "react";
import type { z } from "zod";
import { applicantSchema } from "@/lib/candidatures";

interface Props {
  opportunityId: string;
  isFree: boolean;
  price: number | null;
  type: string;
}

type FormData = z.input<typeof applicantSchema>;

export default function ApplicationForm({ opportunityId, isFree, price, type }: Props) {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [wantsToUploadCV, setWantsToUploadCV] = useState(false);
  const [cvFiles, setCvFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    const result = applicantSchema.safeParse(form);
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[name as keyof FormData];
      if (fieldError) setErrors((prev) => ({ ...prev, [name]: fieldError[0] }));
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (cvFiles.length + files.length > 5) {
      setServerError("Maximum 5 fichiers autorisés.");
      return;
    }
    for (const file of files) {
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
        const res = await fetch("/api/fichiers-candidature", { method: "POST" });
        if (!res.ok) throw new Error();
        const { path, token } = await res.json();
        const { error } = await supabase.storage
          .from("applications")
          .uploadToSignedUrl(path, token, file, { contentType: "application/pdf" });

        if (error) throw error;
        uploaded.push(path);
      } catch {
        failed.push(file.name);
      }
    }

    if (failed.length > 0) {
      setServerError(`Échec de l'envoi de : ${failed.join(", ")}. Réessayez.`);
    }
    setCvFiles((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    setConsentError(consent ? "" : "Votre accord est nécessaire pour envoyer la candidature.");
    const result = applicantSchema.safeParse(form);
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
    if (!consent) return;

    setLoading(true);

    try {
      const res = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          opportunityId,
          files: cvFiles,
          consent,
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
        <p className="text-lg font-bold text-green-700">Candidature reçue</p>

        {!isFree && (
          <p className="mt-3 leading-relaxed text-gray-600">
            Pour finaliser votre candidature, nos services vous contacteront dans les plus brefs
            délais via WhatsApp pour vous accompagner dans la procédure de règlement.
          </p>
        )}

        <p className="mt-3 text-sm text-gray-500">Merci de votre intérêt pour cette opportunité.</p>
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
            Format accepté : PDF uniquement (5 fichiers au maximum, 5 Mo chacun). Ils ne sont
            visibles que par l’équipe de la mairie et supprimés au plus tard 6 mois après l’envoi.
          </p>
          <input
            type="file"
            aria-label="Choisir les documents à joindre"
            multiple
            accept="application/pdf,.pdf"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-700 hover:file:bg-green-100"
          />
          {uploading && <p className="mt-2 text-sm text-gray-500">Envoi en cours...</p>}
          {cvFiles.map((_, i) => (
            <p key={i} className="mt-1 text-sm text-green-600">
              Fichier {i + 1} envoyé
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
        <div>
          <label
            htmlFor="application-fullName"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="application-fullName"
            name="fullName"
            required
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.fullName ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label
            htmlFor="application-phone"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Numéro WhatsApp <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="application-phone"
            name="phone"
            required
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="01 XX XX XX XX"
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.phone ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label
            htmlFor="application-email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Adresse email (optionnel)
          </label>
          <input
            type="email"
            id="application-email"
            name="email"
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.email ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label
            htmlFor="application-message"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Message de motivation (optionnel)
          </label>
          <textarea
            id="application-message"
            name="message"
            rows={3}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none ${errors.message ? "border-red-400" : "border-gray-300"}`}
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>

        {type === "JOB" &&
          uploadSection("Je souhaite joindre des documents (CV, lettre de motivation...)")}
        {type === "TRAINING" &&
          uploadSection("Je souhaite joindre des documents (attestations, diplômes...)")}

        {/* Book V of the digital code: a separate statement, never ticked in advance */}
        <div>
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked);
                setConsentError("");
              }}
              className="mt-0.5 h-4 w-4 shrink-0"
            />
            <span>
              J’accepte que ma candidature et mes documents soient conservés hors du Bénin, sur des
              serveurs en Irlande, pendant 6 mois au plus. Je peux retirer cet accord à tout moment.{" "}
              <Link href="/confidentialite" target="_blank" className="text-green-800 underline">
                Politique de confidentialité
              </Link>{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>
          {consentError && <p className="mt-1 text-xs text-red-500">{consentError}</p>}
        </div>

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
