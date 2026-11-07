import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PortalPage({ params }: Props) {
  const { token } = await params;

  const validToken = process.env.ADMIN_SECRET_TOKEN;

  if (!validToken || token !== validToken) {
    notFound();
  }

  return <LoginForm />;
}
