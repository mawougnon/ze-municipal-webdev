import Link from "next/link";
import type { ReactNode } from "react";
import AdminBackLink from "@/components/AdminBackLink";

interface Item {
  id: string;
  title: string;
  details: ReactNode;
}

interface Props {
  title: string;
  basePath: string;
  newLabel: string;
  emptyLabel: string;
  items: Item[];
}

export function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`rounded-full px-2 py-0.5 ${className}`}>{children}</span>;
}

export function PublishedBadge({ published }: { published: boolean }) {
  return published ? (
    <Badge className="bg-green-100 text-green-700">Publié</Badge>
  ) : (
    <Badge className="bg-yellow-100 text-yellow-700">Brouillon</Badge>
  );
}

export default function AdminList({ title, basePath, newLabel, emptyLabel, items }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <AdminBackLink />
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <Link
            href={`${basePath}/nouveau`}
            className="rounded-lg bg-green-700 px-4 py-2 text-white transition hover:bg-green-800"
          >
            + {newLabel}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500">{emptyLabel}</div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`${basePath}/${item.id}`}
                className="block rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-green-300"
              >
                <h2 className="font-semibold break-words text-gray-800">{item.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">{item.details}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
