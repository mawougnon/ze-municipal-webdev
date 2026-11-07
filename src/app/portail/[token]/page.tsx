import { notFound } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SecretEntry({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const validToken = process.env.ADMIN_SECRET_TOKEN;

  // A wrong token looks like any page that does not exist
  if (!validToken || token !== validToken) {
    notFound();
  }

  return <LoginForm />;
}
