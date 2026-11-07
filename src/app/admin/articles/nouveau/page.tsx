import ArticleForm from "@/components/ArticleForm";
import { requireAdmin } from "@/lib/admin";

export default async function NewArticlePage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-800">Nouvel article</h1>
        <ArticleForm
          initial={{
            title: "",
            content: "",
            coverImageUrl: "",
            coverFocusX: 50,
            coverFocusY: 50,
            photos: [],
            published: false,
          }}
        />
      </div>
    </main>
  );
}
