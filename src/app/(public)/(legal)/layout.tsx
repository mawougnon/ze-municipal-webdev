export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      <article className="mx-auto max-w-3xl px-4 py-10 text-gray-700 md:px-6 md:py-14 [&_a]:break-words [&_a]:text-green-800 [&_a]:underline [&_h1]:mb-2 [&_h1]:font-serif [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-gray-900 [&_li]:mt-1 [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </article>
    </main>
  );
}
