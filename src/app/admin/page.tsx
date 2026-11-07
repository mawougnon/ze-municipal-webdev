import Link from "next/link";
import { FaBriefcase, FaFileAlt, FaInbox, FaLock, FaNewspaper, FaUsers } from "react-icons/fa";
import { signOut } from "@/auth";
import { ROLE_LABELS } from "@/lib/accounts";
import { requireAdmin } from "@/lib/admin";
import { plural } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await requireAdmin();

  const [articleCount, documentCount, opportunityCount, applicationCount, accountCount] =
    await Promise.all([
      prisma.article.count(),
      prisma.document.count(),
      prisma.opportunity.count(),
      prisma.application.count(),
      prisma.user.count(),
    ]);

  const publishedArticles = await prisma.article.count({ where: { published: true } });
  const publishedDocuments = await prisma.document.count({ where: { published: true } });

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const sections = [
    {
      label: "Articles",
      href: "/admin/articles",
      icon: <FaNewspaper />,
      stat: `${publishedArticles}/${articleCount} publiés`,
    },
    {
      label: "Documents",
      href: "/admin/documents",
      icon: <FaFileAlt />,
      stat: `${publishedDocuments}/${documentCount} publiés`,
    },
    {
      label: "Offres et formations",
      href: "/admin/opportunites",
      icon: <FaBriefcase />,
      stat: plural(opportunityCount, "offre"),
    },
    {
      label: "Candidatures reçues",
      href: "/admin/candidatures",
      icon: <FaInbox />,
      stat: plural(applicationCount, "candidature"),
    },
    ...(session.user.role === "SUPERADMIN"
      ? [
          {
            label: "Comptes",
            href: "/admin/comptes",
            icon: <FaUsers />,
            stat: plural(accountCount, "compte"),
          },
          {
            label: "Journal d’activité",
            href: "/admin/journal",
            icon: <FaLock />,
            stat: "Connexions et modifications",
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
            {session?.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">
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
              className="rounded-lg border border-red-200 px-4 py-2 text-xs text-red-700 transition hover:border-red-400 hover:text-red-900"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-10">
        <div className="mb-10">
          <p className="mb-1 text-xs font-semibold tracking-widest text-green-700 uppercase">
            Tableau de bord
          </p>
          <h1 className="font-serif text-3xl font-bold text-gray-900">
            Bonjour, {session?.user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Mairie des Jeunes de Zè · Espace d’administration
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Articles", value: articleCount, color: "text-blue-600", bg: "bg-blue-50" },
            {
              label: "Documents",
              value: documentCount,
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
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl border border-gray-100 p-5 text-center`}
            >
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="mt-1 text-xs tracking-wide text-gray-700 uppercase">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-xl border border-gray-100 bg-white p-6 transition hover:border-green-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-3 block text-2xl text-green-800">{section.icon}</span>
                  <h3 className="font-semibold text-gray-800 transition group-hover:text-green-700">
                    {section.label}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{section.stat}</p>
                </div>
                <span className="text-xl text-gray-500 transition group-hover:text-green-600">
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
