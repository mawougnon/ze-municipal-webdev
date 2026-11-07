import "server-only";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

export async function superadminAccess() {
  const session = await auth();
  if (!session) {
    return { refusal: NextResponse.json({ error: "Non autorisé." }, { status: 401 }) };
  }
  if (session.user.role !== "SUPERADMIN") {
    return { refusal: NextResponse.json({ error: "Non autorisé." }, { status: 403 }) };
  }
  return { session };
}
