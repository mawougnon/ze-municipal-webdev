import "server-only";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { errorResponse } from "@/lib/request";

// Called first by every admin page: the proxy only hides them
export async function requireAdmin() {
  const session = await auth();
  if (!session) notFound();
  return session;
}

export async function requireSuperadmin() {
  const session = await requireAdmin();
  if (session.user.role !== "SUPERADMIN") notFound();
  return session;
}

export async function adminAccess() {
  const session = await auth();
  if (!session) return { denied: errorResponse("Non autorisé.", 401) };
  return { session };
}

export async function superadminAccess() {
  const session = await auth();
  if (!session) return { denied: errorResponse("Non autorisé.", 401) };
  if (session.user.role !== "SUPERADMIN") return { denied: errorResponse("Non autorisé.", 403) };
  return { session };
}
