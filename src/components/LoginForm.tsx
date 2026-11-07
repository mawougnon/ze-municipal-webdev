"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Step 1: ask for a code. The answer is the same whether or not the address has an account.
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setStep(2);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: check the code
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, otp, redirect: false });

    if (result?.error) {
      setError("Code incorrect ou expiré.");
      setLoading(false);
    } else {
      // replace: the back button must not return to the login form
      router.replace("/admin");
      router.refresh();
    }
  }

  function goBack() {
    setStep(1);
    setOtp("");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1f17] px-4">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-[#1a3a2a] px-8 py-8 text-center">
            <div className="mb-5 flex justify-center gap-4">
              <Image
                src="/logo-association-mj-ze.jpg"
                alt="Mairie des Jeunes de Zè"
                width={100}
                height={40}
                className="rounded bg-white object-contain px-1"
              />
            </div>
            <h1 className="font-serif text-xl font-semibold tracking-wide text-white">
              Mairie des Jeunes de Zè
            </h1>
            <p className="mt-1 text-xs tracking-widest text-white/40 uppercase">
              Administration · Accès Restreint
            </p>
          </div>

          <div className="space-y-5 px-8 py-8">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs tracking-widest text-gray-500 uppercase"
                  >
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 transition-colors placeholder:text-gray-300 focus:border-[#1a3a2a] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-70"
                  style={{ backgroundColor: loading ? "#9ca3af" : "#1a3a2a" }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Vérification..." : "Continuer →"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleLogin} className="space-y-5">
                <p className="text-center text-xs text-gray-500">
                  Si <span className="font-semibold text-gray-700">{email}</span> correspond à un
                  compte, un code vient d’y être envoyé. Pensez à vérifier les courriers
                  indésirables.
                </p>

                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1.5 block text-xs tracking-widest text-gray-500 uppercase"
                  >
                    Code à 6 chiffres
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-4 text-center text-3xl font-bold tracking-[0.4em] text-[#1a3a2a] transition-colors placeholder:text-gray-200 focus:border-[#1a3a2a] focus:outline-none"
                  />
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Ce code expire dans 10 minutes.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all disabled:opacity-70"
                  style={{ backgroundColor: loading ? "#9ca3af" : "#16a34a" }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Vérification..." : "Confirmer l'accès"}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full text-xs text-gray-500 underline underline-offset-2 transition hover:text-gray-600"
                >
                  ← Changer d’adresse email
                </button>
              </form>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 text-center">
            <p className="text-xs text-gray-500">
              Accès réservé aux membres autorisés de la Mairie des Jeunes de Zè
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
