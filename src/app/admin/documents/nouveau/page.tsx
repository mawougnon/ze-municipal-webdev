import DocumentForm from "@/components/DocumentForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewDocumentPage() {
  await requireAdmin();

  // This locale writes dates as YYYY-MM-DD, the format of a date field
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Africa/Porto-Novo" });

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Nouveau document</h1>
        <DocumentForm
          initial={{
            title: "",
            description: "",
            fileUrl: "",
            date: today,
            featured: false,
            published: false,
          }}
        />
      </div>
    </main>
  );
}
