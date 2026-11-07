import "server-only";
import { auth } from "@/auth";
import { notFound } from "next/navigation";

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

export async function superadminSession() {
  const session = await auth();
  return session?.user.role === "SUPERADMIN" ? session : null;
}
