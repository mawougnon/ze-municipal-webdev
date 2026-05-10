import { notFound } from "next/navigation";
import LoginPage from "@/app/login/page";

export default async function SecretEntry({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const validToken = process.env.ADMIN_SECRET_TOKEN;

  // Invalid token → fake 404
  if (!validToken || token !== validToken) {
    notFound();
  }

  // Valid token → render login page directly
  return <LoginPage />;
}