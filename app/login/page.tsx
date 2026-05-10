"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Import the spinner icon
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]             = useState("");
  const [otp, setOtp]                 = useState("");
  const [password, setPassword]       = useState("");
  const [step, setStep]               = useState<1 | 2>(1);
  const [usePassword, setUsePassword] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const router = useRouter();

  // Step 1 — send OTP to email
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

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        setLoading(false); // Ensure loading stops on error
        return;
      }

      setIsSuperAdmin(data.isSuperAdmin ?? false);
      setStep(2);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2 — verify OTP or password
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const credentials: Record<string, string> = { email };
    if (usePassword) {
      credentials.password = password;
    } else {
      credentials.otp = otp;
    }

    const result = await signIn("credentials", {
      ...credentials,
      redirect: false,
    });

    if (result?.error) {
      setError("Code ou mot de passe incorrect.");
      setLoading(false);
    } else {
      // The TopLoader in layout.tsx will trigger during this redirect
      window.location.href = "/admin";
    }
  }

  function goBack() {
    setStep(1);
    setOtp("");
    setPassword("");
    setError("");
    setUsePassword(false);
    setIsSuperAdmin(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1f17] px-4">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="bg-[#1a3a2a] px-8 py-8 text-center">
            <div className="flex justify-center gap-4 mb-5">
              <Image src="/logo-association-mj-ze.jpg" alt="Mairie des Jeunes de Zè"
                width={100} height={40} className="object-contain bg-white rounded px-1" />
            </div>
            <h1 className="font-serif text-xl font-semibold text-white tracking-wide">
              Mairie des Jeunes de Zè
            </h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
              Administration — Accès Restreint
            </p>
          </div>

          <div className="px-8 py-8 space-y-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#1a3a2a] transition-colors"
                  />
                </div>
                {/* Updated Button with Spinner */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-70"
                  style={{ backgroundColor: loading ? "#9ca3af" : "#1a3a2a" }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Vérification..." : "Continuer →"}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleLogin} className="space-y-5">
                <p className="text-xs text-gray-400 text-center">
                  Code envoyé à <span className="font-semibold text-gray-700">{email}</span>
                </p>

                {!usePassword ? (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">
                      Code OTP à 6 chiffres
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="— — — — — —"
                      maxLength={6}
                      required
                      className="w-full px-4 py-4 rounded-lg border border-gray-200 text-center text-3xl font-bold tracking-[0.4em] text-[#1a3a2a] placeholder:text-gray-200 focus:outline-none focus:border-[#1a3a2a] transition-colors"
                    />
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Ce code expire dans 10 minutes.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a2a] transition-colors"
                    />
                  </div>
                )}

                {isSuperAdmin && (
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={() => { setUsePassword(v => !v); setError(""); }}
                      className="h-4 w-4 accent-[#1a3a2a] cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">
                      Utiliser mon mot de passe à la place
                    </span>
                  </label>
                )}

                {/* Updated Login Button with Spinner */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3 flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-70"
                  style={{ backgroundColor: loading ? "#9ca3af" : "#16a34a" }}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Vérification..." : "Confirmer l'accès"}
                </button>

                <button type="button" onClick={goBack}
                  className="w-full text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition">
                  ← Changer d'adresse email
                </button>
              </form>
            )}
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-300">
              Accès réservé aux membres autorisés de la Mairie des Jeunes de Zè
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
