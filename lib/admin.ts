import "server-only";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

// The proxy only hides the admin pages. Every admin page that reads the database
// calls this first, so a proxy bypass still exposes nothing.
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

// The same rule for the API routes, which answer with a status code instead of a page
export async function superadminSession() {
  const session = await auth();
  return session?.user.role === "SUPERADMIN" ? session : null;
}
