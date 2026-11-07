import Link from "next/link";
import AccountManager from "@/components/AccountManager";
import { ROLE_LABELS } from "@/lib/accounts";
import { requireSuperadmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function AccountsPage() {
  const session = await requireSuperadmin();

  const accounts = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
          ← Retour au tableau de bord
        </Link>
        <h1 className="mt-4 mb-2 text-2xl font-bold text-gray-800">Comptes</h1>
        <p className="mb-6 text-sm text-gray-500">
          {ROLE_LABELS.ADMIN} : publie les contenus et traite les candidatures.{" "}
          {ROLE_LABELS.SUPERADMIN} : gère aussi les comptes et consulte le journal.
        </p>
        <AccountManager accounts={accounts} ownEmail={session.user.email} />
      </div>
    </main>
  );
}
