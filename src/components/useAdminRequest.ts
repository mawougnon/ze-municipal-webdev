"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAdminRequest(redirectTo: string) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function send(url: string, method: string, body?: object) {
    setSaving(true);
    setError("");
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body && JSON.stringify(body),
    }).catch(() => null);

    if (response?.ok) {
      router.push(redirectTo);
      router.refresh();
      return;
    }
    const answer = await response?.json().catch(() => null);
    setError(answer?.error ?? "L’enregistrement a échoué. Réessayez.");
    setSaving(false);
  }

  return { saving, error, setError, send };
}
