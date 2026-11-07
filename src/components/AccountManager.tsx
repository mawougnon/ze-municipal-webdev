"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ROLE_LABELS } from "@/lib/accounts";

interface Account {
  id: string;
  name: string | null;
  email: string;
  role: keyof typeof ROLE_LABELS;
}

const FIELD = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";

function RoleOptions() {
  return Object.entries(ROLE_LABELS).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));
}

export default function AccountManager({
  accounts,
  ownEmail,
}: {
  accounts: Account[];
  ownEmail: string | null | undefined;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [refreshing, startRefresh] = useTransition();
  const saving = sending || refreshing;

  async function send(url: string, method: string, body?: object) {
    setSending(true);
    setError("");
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    }).catch(() => null);
    setSending(false);

    if (res?.ok) {
      startRefresh(() => router.refresh());
      return true;
    }
    const answer = await res?.json().catch(() => null);
    setError(answer?.error ?? "Erreur. Réessayez.");
    return false;
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (await send("/api/comptes", "POST", Object.fromEntries(new FormData(form)))) form.reset();
  }

  return (
    <>
      <p role="status" className="mb-2 h-5 text-sm text-gray-500">
        {saving && "Enregistrement..."}
      </p>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="mb-8 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
        {accounts.map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-48 flex-1">
              <p className="text-sm font-semibold break-words text-gray-800">{a.name}</p>
              <p className="text-xs break-all text-gray-500">{a.email}</p>
            </div>
            {a.email === ownEmail ? (
              <span className="text-sm text-gray-500">{ROLE_LABELS[a.role]} (vous)</span>
            ) : (
              <>
                <select
                  aria-label={`Rôle de ${a.email}`}
                  value={a.role}
                  disabled={saving}
                  onChange={(e) => send(`/api/comptes/${a.id}`, "PATCH", { role: e.target.value })}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <RoleOptions />
                </select>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (confirm(`Supprimer le compte ${a.email} ? L’accès est retiré aussitôt.`)) {
                      send(`/api/comptes/${a.id}`, "DELETE");
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={add} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-1 font-semibold text-gray-800">Ajouter un compte</h2>
        <p className="mb-4 text-sm text-gray-500">
          Il n’y a pas de mot de passe : la personne reçoit un code à cette adresse à chaque
          connexion. L’adresse de la page de connexion reste à lui transmettre.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="account-name" className="mb-1 block text-sm text-gray-700">
              Nom
            </label>
            <input
              id="account-name"
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="off"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="account-email" className="mb-1 block text-sm text-gray-700">
              Adresse email
            </label>
            <input
              id="account-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="off"
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="account-role" className="mb-1 block text-sm text-gray-700">
              Rôle
            </label>
            <select id="account-role" name="role" defaultValue="ADMIN" className={FIELD}>
              <RoleOptions />
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-lg bg-green-700 px-6 py-2 text-sm text-white transition hover:bg-green-800 disabled:opacity-50"
        >
          Ajouter
        </button>
      </form>
    </>
  );
}
