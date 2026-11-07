import Link from "next/link";

export default function AdminBackLink() {
  return (
    <Link href="/admin" className="mb-4 inline-block text-sm text-gray-600 hover:text-gray-900">
      ← Retour au tableau de bord
    </Link>
  );
}
