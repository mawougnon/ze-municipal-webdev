import { auth, signOut } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const revalidate = 0;

export default async function AdminPage() {
  const session = await auth();

  const [articleCount, ptaCount, opportunityCount, applicationCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.ptaActivity.count(),
      prisma.opportunity.count(),
      prisma.application.count(),
    ]);

  const publishedArticles = await prisma.article.count({ where: { published: true } });
  const completedPta = await prisma.ptaActivity.count({ where: { status: "COMPLETED" } });

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const sections = [
    { label: "Articles", href: "/admin/articles", icon: "📰",
      stat: `${publishedArticles}/${articleCount} publiés` },
    { label: "Plan de Travail (PTA)", href: "/admin/pta", icon: "📋",
      stat: `${completedPta}/${ptaCount} terminés` },
    { label: "Offres & Formations", href: "/admin/opportunites", icon: "💼",
      stat: `${opportunityCount} offre(s)` },
    { label: "Candidatures reçues", href: "/admin/candidatures", icon: "📨",
      stat: `${applicationCount} candidature(s)` },
  ];

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-bold">
            {session?.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-gray-800 font-semibold text-sm">
              {session?.user?.name}
            </p>
            <p className="text-gray-400 text-xs">
              {(session?.user as any)?.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank"
            className="text-xs text-green-700 hover:underline">
            Voir le site →
          </Link>
          <form action={handleSignOut}>
            <button type="submit"
              className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-lg transition">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <p className="text-green-700 text-xs uppercase tracking-widest font-semibold mb-1">
            Tableau de bord
          </p>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Bonjour, {session?.user?.name} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Mairie des Jeunes de Zè — Espace Administration
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Articles", value: articleCount, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Activités PTA", value: ptaCount, color: "text-yellow-600", bg: "bg-yellow-50" },
            { label: "Offres", value: opportunityCount, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Candidatures", value: applicationCount, color: "text-green-700", bg: "bg-green-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-5 text-center border border-gray-100`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}
              className="bg-white border border-gray-100 hover:border-green-300 hover:shadow-md rounded-xl p-6 transition group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-2xl mb-3 block">{s.icon}</span>
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition">
                    {s.label}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1">{s.stat}</p>
                </div>
                <span className="text-gray-300 group-hover:text-green-600 transition text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Audit log preview */}
        <AuditLogPreview />
      </div>
    </main>
  );
}

async function AuditLogPreview() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  if (logs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
      <h3 className="text-gray-700 font-semibold mb-4 text-sm uppercase tracking-widest">
        Dernières connexions
      </h3>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id}
            className="flex items-center justify-between text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <span className={`font-medium ${
              log.action.includes("SUCCESS") ? "text-green-600" : "text-red-500"
            }`}>
              {log.action === "LOGIN_OTP_SUCCESS" ? "✅ Connexion OTP" :
               log.action === "LOGIN_PASSWORD_SUCCESS" ? "✅ Connexion mot de passe" :
               "❌ Tentative échouée"}
            </span>
            <span className="text-gray-400 text-xs">{log.userEmail}</span>
            <span className="text-gray-300 text-xs">
              {new Date(log.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short",
                hour: "2-digit", minute: "2-digit"
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}