"use client";

import Link from "next/link";
import { useState } from "react";
import { flattenError } from "zod/mini";
import type { z } from "zod/mini";
import { applicantSchema } from "@/lib/applications";
import { formatPrice } from "@/lib/format";

interface Props {
  opportunityId: string;
  isFree: boolean;
  price: number | null;
  type: string;
}

type ApplicantFields = z.input<typeof applicantSchema>;
type FieldErrors = Partial<Record<keyof ApplicantFields, string[]>>;

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

async function uploadFile(file: File) {
  const { supabase } = await import("@/lib/supabase");
  const response = await fetch("/api/fichiers-candidature", { method: "POST" });
  if (!response.ok) throw new Error("No upload link");
  const { path, token } = await response.json();
  const { error } = await supabase.storage
    .from("applications")
    .uploadToSignedUrl(path, token, file, { contentType: "application/pdf" });
  if (error) throw error;
  return path as string;
}

interface FieldProps {
  name: keyof ApplicantFields;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  multiline?: boolean;
  error?: string;
  onChange: (name: keyof ApplicantFields, value: string) => void;
  onBlur: (name: keyof ApplicantFields) => void;
}

function Field({
  name,
  label,
  required,
  type = "text",
  placeholder,
  autoComplete,
  multiline,
  error,
  onChange,
  onBlur,
}: FieldProps) {
  const id = `application-${name}`;
  const errorId = `${id}-error`;
  const shared = {
    id,
    name,
    required,
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(name, e.target.value),
    onBlur: () => onBlur(name),
    className: `w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-green-600 focus:outline-none ${error ? "border-red-400" : "border-gray-300"}`,
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-700">*</span>}
      </label>
      {multiline ? (
        <textarea rows={3} {...shared} />
      ) : (
        <input type={type} placeholder={placeholder} autoComplete={autoComplete} {...shared} />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ApplicationForm({ opportunityId, isFree, price, type }: Props) {
  const [form, setForm] = useState<ApplicantFields>({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [wantsToAttach, setWantsToAttach] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(name: keyof ApplicantFields, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleBlur(name: keyof ApplicantFields) {
    const result = applicantSchema.safeParse(form);
    const fieldError = result.success ? undefined : flattenError(result.error).fieldErrors[name];
    if (fieldError) setErrors((current) => ({ ...current, [name]: fieldError }));
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length === 0) return;

    if (files.length + picked.length > MAX_FILES) {
      setServerError(`${MAX_FILES} fichiers au maximum.`);
      return;
    }
    const notPdf = picked.find((file) => file.type !== "application/pdf");
    if (notPdf) {
      setServerError(`« ${notPdf.name} » n’est pas un PDF. Seuls les fichiers PDF sont acceptés.`);
      return;
    }
    const tooBig = picked.find((file) => file.size > MAX_FILE_BYTES);
    if (tooBig) {
      setServerError(`Le fichier « ${tooBig.name} » dépasse 5 Mo.`);
      return;
    }

    setServerError("");
    setUploading(true);
    const failed: string[] = [];
    for (const file of picked) {
      try {
        const path = await uploadFile(file);
        setFiles((current) => [...current, path]);
      } catch {
        failed.push(file.name);
      }
    }
    if (failed.length > 0) {
      setServerError(`Échec de l’envoi de : ${failed.join(", ")}. Réessayez.`);
    }
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setConsentError(consent ? "" : "Votre accord est nécessaire pour envoyer la candidature.");

    const result = applicantSchema.safeParse(form);
    if (!result.success) {
      setErrors(flattenError(result.error).fieldErrors);
      return;
    }
    if (!consent) return;

    setSending(true);
    const response = await fetch("/api/candidatures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, opportunityId, files, consent }),
    }).catch(() => null);

    if (response?.ok) {
      setSuccess(true);
    } else {
      const answer = await response?.json().catch(() => null);
      if (answer?.details) setErrors(answer.details);
      else setServerError(answer?.error ?? "Une erreur est survenue. Réessayez.");
    }
    setSending(false);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-bold text-green-800">Candidature reçue</p>
        {!isFree && (
          <p className="mt-3 leading-relaxed text-gray-600">
            Pour finaliser votre candidature, nos services vous contacteront dans les plus brefs
            délais via WhatsApp pour vous accompagner dans la procédure de règlement.
          </p>
        )}
        <p className="mt-3 text-sm text-gray-600">Merci de votre intérêt pour cette opportunité.</p>
      </div>
    );
  }

  const field = { onChange: handleChange, onBlur: handleBlur };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-bold text-gray-800">
        {isFree ? "Postuler gratuitement" : `Postuler (${formatPrice(price)} XOF)`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field
          name="fullName"
          label="Nom complet"
          autoComplete="name"
          required
          error={errors.fullName?.[0]}
          {...field}
        />
        <Field
          name="phone"
          label="Numéro WhatsApp"
          type="tel"
          autoComplete="tel"
          placeholder="01 XX XX XX XX"
          required
          error={errors.phone?.[0]}
          {...field}
        />
        <Field
          name="email"
          label="Adresse email (optionnel)"
          type="email"
          autoComplete="email"
          error={errors.email?.[0]}
          {...field}
        />
        <Field
          name="message"
          label="Message de motivation (optionnel)"
          multiline
          error={errors.message?.[0]}
          {...field}
        />

        <div className="rounded-lg border border-dashed border-gray-200 p-4">
          <label className="mb-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={wantsToAttach}
              onChange={(e) => setWantsToAttach(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm font-medium text-gray-700">
              {type === "JOB"
                ? "Je souhaite joindre des documents (CV, lettre de motivation...)"
                : "Je souhaite joindre des documents (attestations, diplômes...)"}
            </span>
          </label>

          {wantsToAttach && (
            <div>
              <p className="mb-2 text-sm text-gray-600">
                Format accepté : PDF uniquement ({MAX_FILES} fichiers au maximum, 5 Mo chacun). Ils
                ne sont visibles que par l’équipe de la mairie et supprimés au plus tard 6 mois
                après l’envoi.
              </p>
              <input
                type="file"
                aria-label="Choisir les documents à joindre"
                multiple
                accept="application/pdf,.pdf"
                onChange={handleFiles}
                disabled={uploading}
                className="block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:text-green-800 hover:file:bg-green-100"
              />
              {uploading && <p className="mt-2 text-sm text-gray-600">Envoi en cours...</p>}
              {files.map((path, i) => (
                <p key={path} className="mt-1 text-sm text-green-800">
                  Fichier {i + 1} envoyé
                </p>
              ))}
            </div>
          )}
        </div>

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
              <span className="text-red-700">*</span>
            </span>
          </label>
          {consentError && <p className="mt-1 text-xs text-red-700">{consentError}</p>}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-red-700">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={sending || uploading}
          className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          {sending ? "Envoi en cours..." : "Envoyer ma candidature"}
        </button>
      </form>
    </div>
  );
}
