import { auth } from "@/auth";
import { notFound } from "next/navigation";

// The proxy only hides the admin pages. Every admin page that reads the database
// calls this first, so a proxy bypass still exposes nothing.
export async function requireAdmin() {
  const session = await auth();
  if (!session) notFound();
  return session;
}
