import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <p className="text-sm font-semibold text-green-800">Erreur 404</p>
      <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Page introuvable</h1>
      <p className="mt-3 text-gray-600">Cette page n’existe pas ou n’est plus disponible.</p>
      <Link href="/" className="mt-6 text-green-800 underline">
        Retour à l’accueil
      </Link>
    </main>
  );
}
