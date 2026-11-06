import { notFound } from "next/navigation";
import DocumentForm from "@/components/DocumentForm";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();

  const { id } = await params;
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) notFound();

  const { title, description, fileUrl, date, featured, published } = document;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Modifier le document</h1>
        <DocumentForm
          id={id}
          initial={{
            title,
            description,
            fileUrl,
            date: date.toISOString().slice(0, 10),
            featured,
            published,
          }}
        />
      </div>
    </main>
  );
}
