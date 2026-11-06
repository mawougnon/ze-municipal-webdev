"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="font-serif text-3xl font-bold text-gray-900">Une erreur est survenue</h1>
      <p className="mt-3 text-gray-600">Le problème vient de notre côté. Veuillez réessayer.</p>
      <button type="button" onClick={reset} className="mt-6 text-green-800 underline">
        Réessayer
      </button>
    </main>
  );
}
