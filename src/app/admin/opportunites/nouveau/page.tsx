import OpportunityForm from "@/components/OpportunityForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewOpportunityPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Nouvelle offre</h1>
        <OpportunityForm
          initial={{
            type: "JOB",
            title: "",
            description: "",
            deadline: "",
            isFree: true,
            price: "",
            imageUrl: "",
            published: false,
          }}
        />
      </div>
    </main>
  );
}
