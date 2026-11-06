import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/accounts";

export default async function AdminPage() {
  const session = await requireAdmin();

  const [articleCount, ptaCount, opportunityCount, applicationCount, accountCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.ptaActivity.count(),
      prisma.opportunity.count(),
      prisma.application.count(),
      prisma.user.count(),
    ]);

  const publishedArticles = await prisma.article.count({ where: { published: true } });
  const completedPta = await prisma.ptaActivity.count({ where: { status: "COMPLETED" } });

  async function handleSignOut() {
    "use server";
    // /login is hidden behind a 404, so go back to the public site
    await signOut({ redirectTo: "/" });
  }

  const sections = [
    {
      label: "Articles",
      href: "/admin/articles",
      icon: "📰",
      stat: `${publishedArticles}/${articleCount} publiés`,
    },
    {
      label: "Plan de Travail (PTA)",
      href: "/admin/pta",
      icon: "📋",
      stat: `${completedPta}/${ptaCount} terminés`,
    },
    {
      label: "Offres & Formations",
      href: "/admin/opportunites",
      icon: "💼",
      stat: `${opportunityCount} offre(s)`,
    },
    {
      label: "Candidatures reçues",
      href: "/admin/candidatures",
      icon: "📨",
      stat: `${applicationCount} candidature(s)`,
    },
    ...(session.user.role === "SUPERADMIN"
      ? [
          {
            label: "Comptes",
            href: "/admin/comptes",
            icon: "👥",
            stat: `${accountCount} compte(s)`,
          },
          {
            label: "Journal d’activité",
            href: "/admin/journal",
            icon: "🔒",
            stat: "Connexions et modifications",
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
            {session?.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
            <p className="text-xs text-gray-400">
              {session.user.role && ROLE_LABELS[session.user.role]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" target="_blank" className="text-xs text-green-700 hover:underline">
            Voir le site →
          </Link>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-500 transition hover:border-red-400 hover:text-red-700"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <p className="mb-1 text-xs font-semibold tracking-widest text-green-700 uppercase">
            Tableau de bord
          </p>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Bonjour, {session?.user?.name} 👋
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Mairie des Jeunes de Zè · Espace Administration
          </p>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Articles", value: articleCount, color: "text-blue-600", bg: "bg-blue-50" },
            {
              label: "Activités PTA",
              value: ptaCount,
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Offres",
              value: opportunityCount,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              label: "Candidatures",
              value: applicationCount,
              color: "text-green-700",
              bg: "bg-green-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-xl border border-gray-100 p-5 text-center`}
            >
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-xs tracking-wide text-gray-500 uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-xl border border-gray-100 bg-white p-6 transition hover:border-green-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-3 block text-2xl">{s.icon}</span>
                  <h3 className="font-semibold text-gray-800 transition group-hover:text-green-700">
                    {s.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">{s.stat}</p>
                </div>
                <span className="text-xl text-gray-300 transition group-hover:text-green-600">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
