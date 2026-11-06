import Link from "next/link";
import { requireSuperadmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;
const LAST_PAGE = 100_000; // keeps the offset within what the database accepts

const LABELS: Record<string, { label: string; color: string }> = {
  LOGIN_OTP_SENT: { label: "Code envoyé", color: "text-gray-500" },
  LOGIN_OTP_SUCCESS: { label: "Connexion", color: "text-green-700" },
  LOGIN_OTP_FAILED: { label: "Code incorrect", color: "text-red-600" },
  LOGIN_OTP_LOCKED: { label: "Code bloqué après 5 essais", color: "text-red-700" },
  // Rows written before the login by email code
  LOGIN_PASSWORD_SUCCESS: { label: "Connexion (ancien mot de passe)", color: "text-green-700" },
  LOGIN_PASSWORD_FAILED: { label: "Mot de passe incorrect", color: "text-red-600" },

  ACCOUNT_CREATED: { label: "Compte créé", color: "text-amber-700" },
  ACCOUNT_ROLE_CHANGED: { label: "Rôle modifié", color: "text-amber-700" },
  ACCOUNT_DELETED: { label: "Compte supprimé", color: "text-amber-700" },

  ARTICLE_SAVED_ONLINE: { label: "Article enregistré, en ligne", color: "text-gray-700" },
  ARTICLE_SAVED_DRAFT: { label: "Article enregistré, brouillon", color: "text-gray-700" },
  ARTICLE_DELETED: { label: "Article supprimé", color: "text-gray-700" },
  OFFER_SAVED_ONLINE: { label: "Offre enregistrée, en ligne", color: "text-gray-700" },
  OFFER_SAVED_DRAFT: { label: "Offre enregistrée, brouillon", color: "text-gray-700" },
  OFFER_DELETED: { label: "Offre supprimée", color: "text-gray-700" },
  APPLICATION_DELETED: { label: "Candidature supprimée", color: "text-gray-700" },
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireSuperadmin();

  const { page } = await searchParams;
  const current = Math.min(Math.max(Math.floor(Number(page)) || 1, 1), LAST_PAGE);

  // One row more than displayed tells whether a next page exists
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: (current - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
  });
  const logs = rows.slice(0, PAGE_SIZE);

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-800">
          ← Retour au tableau de bord
        </Link>
        <h1 className="mt-4 mb-6 text-2xl font-bold text-gray-800">Journal d’activité</h1>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
          {logs.length === 0 && <p className="p-4 text-sm text-gray-500">Aucun événement.</p>}
          {logs.map((log) => {
            const entry = LABELS[log.action] ?? { label: log.action, color: "text-gray-500" };
            return (
              <div
                key={log.id}
                className="grid grid-cols-1 gap-1 p-4 text-sm md:grid-cols-4 md:items-center"
              >
                <div>
                  <p className={`font-medium ${entry.color}`}>{entry.label}</p>
                  {log.target && <p className="text-xs break-words text-gray-500">{log.target}</p>}
                </div>
                <span className="text-xs break-all text-gray-500">{log.userEmail}</span>
                <span className="text-xs text-gray-500">{log.ipAddress ?? "IP inconnue"}</span>
                <span className="text-xs text-gray-500 md:text-right">
                  {formatDate(log.createdAt, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>

        <nav aria-label="Pages du journal" className="mt-4 flex justify-between text-sm">
          {current > 1 ? (
            <Link href={`/admin/journal?page=${current - 1}`} className="text-green-700">
              ← Plus récents
            </Link>
          ) : (
            <span />
          )}
          {rows.length > PAGE_SIZE && current < LAST_PAGE && (
            <Link href={`/admin/journal?page=${current + 1}`} className="text-green-700">
              Plus anciens →
            </Link>
          )}
        </nav>
      </div>
    </main>
  );
}
