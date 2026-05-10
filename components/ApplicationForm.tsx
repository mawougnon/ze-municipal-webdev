"use client";

import { useState } from "react";
import { z } from "zod";

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
    .trim()
    .transform((val) => val.replace(/\s+/g, "")) 
    .pipe(
      z.string()
       .regex(/^01[0-9]{8}$/, "Le numéro doit comporter 10 chiffres et commencer par 01.")
    ),

  email: z
    .string()
    .email("Adresse email invalide.")
    .optional()
    .or(z.literal("")),

  message: z
    .string()
    .max(1000, "Message trop long (max 1000 caractères).")
    .optional(),
});


type FormData = z.infer<typeof schema>;

export default function ApplicationForm({ opportunityId, isFree, price, type }: Props) {
  const [form, setForm] = useState<FormData>({
    fullName: "", phone: "", email: "", message: "",
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
      if (file.size > 5 * 1024 * 1024) {
        setServerError(`Le fichier "${file.name}" dépasse 5MB.`);
        return;
      }
    }

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of files) {
      try {
        const { supabase } = await import("@/lib/supabase");
        const filename = `cv-${Date.now()}-${file.name.replace(/\s/g, "_")}`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(filename, file, { upsert: false });

        if (!error) {
          const { data } = supabase.storage.from("documents").getPublicUrl(filename);
          uploaded.push(data.publicUrl);
        }
      } catch {
        console.error("Upload failed for", file.name);
      }
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
    } catch (err: any) {
      setServerError(err.message || "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <p className="text-green-700 font-bold text-lg">✅ Candidature reçue !</p>
        
        {/* Payment message — only shown for paid opportunities */}
        {!isFree && (
          <p className="text-gray-600 mt-3 leading-relaxed">
            Pour finaliser votre candidature, nos services vous contacteront 
            dans les plus brefs délais via WhatsApp pour vous accompagner 
            dans la procédure de règlement.
          </p>
        )}

        <p className="text-gray-400 text-sm mt-3">
          Merci de votre intérêt pour cette opportunité.
        </p>
      </div>
    );
  }
  const uploadSection = (label: string) => (
    <div className="border border-dashed border-gray-200 rounded-lg p-4">
      <label className="flex items-center gap-3 cursor-pointer mb-3">
        <input type="checkbox" checked={wantsToUploadCV}
          onChange={(e) => setWantsToUploadCV(e.target.checked)}
          className="w-4 h-4" />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </label>

      {wantsToUploadCV && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Formats acceptés : PDF, Word, images — max 5 fichiers, 5MB chacun
          </p>
          <input
            type="file" multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
          />
          {uploading && <p className="text-sm text-gray-400 mt-2">Envoi en cours...</p>}
          {cvFiles.map((_, i) => (
            <p key={i} className="text-green-600 text-sm mt-1">✅ Fichier {i + 1} uploadé</p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-800 text-lg mb-6">
        {isFree ? "Postuler gratuitement" : `Postuler — ${price?.toLocaleString()} XOF`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>

        {/* Full name — letters only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom complet <span className="text-red-500">*</span>
          </label>
          <input type="text" name="fullName" required
            onChange={handleChange} onBlur={handleBlur}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.fullName ? "border-red-400" : "border-gray-300"}`} />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        {/* WhatsApp — Benin format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro WhatsApp <span className="text-red-500">*</span>
          </label>
          <input type="tel" name="phone" required
            onChange={handleChange} onBlur={handleBlur}
            placeholder="+229 XX XX XX XX"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.phone ? "border-red-400" : "border-gray-300"}`} />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Email — optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresse email (optionnel)
          </label>
          <input type="email" name="email"
            onChange={handleChange} onBlur={handleBlur}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? "border-red-400" : "border-gray-300"}`} />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Message — optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message de motivation (optionnel)
          </label>
          <textarea name="message" rows={3}
            onChange={handleChange} onBlur={handleBlur}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.message ? "border-red-400" : "border-gray-300"}`} />
          {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
        </div>

        {/* File upload — optional, toggled */}
        {type === "JOB" && uploadSection("Je souhaite joindre des documents (CV, lettre de motivation...)")}
        {type === "TRAINING" && uploadSection("Je souhaite joindre des documents (attestations, diplômes...)")}

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button type="submit" disabled={loading || uploading}
          className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition disabled:opacity-50">
          {loading ? "Envoi en cours..." : "Envoyer ma candidature"}
        </button>
      </form>
    </div>
  );
}