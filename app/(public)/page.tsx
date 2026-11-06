import { formatDate, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { openOffersWhere } from "@/lib/offers";
import { DOCUMENT_DATE, publishedDocuments } from "@/lib/documents";

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const { featured, others } = await publishedDocuments();

  const opportunities = await prisma.opportunity.findMany({
    where: openOffersWhere(),
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* HERO: full viewport, site historique background */}
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
        <Image
          src="/population-ze.png"
          alt="Commune de Zè"
          fill
          sizes="100vw"
          className="scale-105 object-cover"
          preload
        />
        {/* Gradient overlay: dark bottom, slightly lighter top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          {/* Logos row */}

          {/* width and height keep each file's real ratio (square, then 720x377), so the
              logos never stretch, and are large enough to stay sharp at their display size */}
          <div className="mb-6 flex items-center justify-center gap-3 md:gap-4">
            <Image
              src="/logo-association-mj-benin.jpg"
              alt="AMJB"
              width={128}
              height={128}
              className="h-14 w-14 rounded-full bg-white object-contain p-1.5 shadow-lg md:h-24 md:w-24"
              preload
            />
            <div className="h-10 w-px bg-white/30 md:h-16" />
            <Image
              src="/logo-association-mj-ze.jpg"
              alt="Mairie des Jeunes de Zè"
              width={192}
              height={100}
              className="h-11 w-auto rounded-lg bg-white object-contain px-2 py-1 shadow-lg md:h-[4.5rem]"
              preload
            />
            <div className="h-10 w-px bg-white/30 md:h-16" />
            <Image
              src="/logo-commune-ze.jpg"
              alt="Commune de Zè"
              width={128}
              height={128}
              className="h-14 w-14 rounded-full bg-white object-contain p-1.5 shadow-lg md:h-24 md:w-24"
              preload
            />
          </div>

          {/* Eyebrow */}
          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-[#D4AF37] uppercase">
            Mandature 2025-2030
          </p>

          <h1 className="mb-4 font-serif text-3xl leading-tight font-bold md:text-6xl">
            Mairie des Jeunes
            <br />
            <span className="text-[#D4AF37]">de Zè</span>
          </h1>

          <p className="mb-2 text-base text-gray-200 italic md:text-xl">
            « Initiative · Engagement · Développement »
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/articles"
              className="rounded-none bg-[#D4AF37] px-8 py-3 text-sm font-bold tracking-wide text-black uppercase transition hover:bg-[#b8962e]"
            >
              Nos Actualités
            </Link>
            <Link
              href="/documents"
              className="rounded-none border-2 border-white px-8 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-white hover:text-black"
            >
              Nos Documents
            </Link>
            <Link
              href="/presentation"
              className="rounded-none border-2 border-[#D4AF37] px-8 py-3 text-sm font-bold tracking-wide text-[#D4AF37] uppercase transition hover:bg-[#D4AF37] hover:text-black"
            >
              Qui sommes-nous ?
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/60">
          <span className="tracking-widest uppercase">Découvrir</span>
          <div className="h-8 w-px animate-pulse bg-white/40" />
        </div>
      </section>

      {/* DEVISE BAND */}
      <section className="bg-green-800 px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 text-sm font-medium tracking-widest text-white uppercase">
          {["Initiative", "Engagement", "Développement"].map((word, i) => (
            <span key={word} className="flex items-center gap-4">
              {i > 0 && <span className="text-[#D4AF37]">◆</span>}
              {word}
            </span>
          ))}
        </div>
      </section>

      {/* BUREAU: Bigger size for the mayor */}
      <section className="bg-[#FAFAF7] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
              Leadership
            </p>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Notre Bureau Exécutif</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-[#D4AF37]" />
          </div>

          {/* Layout : deputy1 | Maire (bigger) | deputy2 */}
          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-8">
            {/* 1er Adjoint */}
            <div className="group order-2 text-center md:order-1">
              <div className="relative mx-auto mb-4 h-44 w-36 overflow-hidden md:h-56 md:w-48">
                <Image
                  src="/adjoint1.jpg"
                  alt="Hounkanlin Sèïgbénan Alphonse"
                  fill
                  sizes="(max-width: 768px) 144px, 192px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                1er Adjoint
              </p>
              <h3 className="mt-1 px-2 font-serif text-sm font-bold text-gray-800 md:text-base">
                Alphonse S. HOUNKANLIN
              </h3>
            </div>

            {/* Mayor: center */}
            <div className="group order-1 text-center md:order-2">
              <div className="relative mx-auto mb-4 h-60 w-48 overflow-hidden border-4 border-[#D4AF37] shadow-2xl md:h-72 md:w-64">
                <Image
                  src="/maire.jpg"
                  alt="Marius Salanon"
                  fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute right-0 bottom-4 left-0 text-center">
                  <span className="bg-[#D4AF37] px-3 py-1 text-xs font-bold tracking-widest text-black uppercase">
                    Maire
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold tracking-widest text-[#8A6D1A] uppercase">Maire</p>
              <h3 className="mt-1 font-serif text-lg font-bold text-gray-800 md:text-xl">
                Marius SALANON
              </h3>
            </div>

            <div className="group order-3 text-center">
              <div className="relative mx-auto mb-4 h-44 w-36 overflow-hidden md:h-56 md:w-48">
                <Image
                  src="/adjoint2.jpg"
                  alt="Josaphat Hounkpe"
                  fill
                  sizes="(max-width: 768px) 144px, 192px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                2e Adjoint
              </p>
              <h3 className="mt-1 font-serif text-sm font-bold text-gray-800 md:text-base">
                Josaphat M. HOUNKPE
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* AMJB PRESIDENT & THE GODFATHER */}
      <section className="bg-green-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          {" "}
          {/* Augmenté à 6xl pour plus d'espace */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#E8C547] uppercase">
              Autorités de Tutelle & Parrainage
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-8 md:flex-row md:gap-4">
            {/* PRESIDENT */}
            <div className="w-full flex-1 text-center">
              <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl md:h-36 md:w-36">
                <Image
                  src="/president-amjb-benin.jpg"
                  alt="Président AMJB Bénin"
                  fill
                  sizes="(max-width: 768px) 112px, 144px"
                  className="object-cover object-top"
                />
              </div>
              <p className="flex min-h-[32px] items-center justify-center text-[10px] font-bold tracking-widest text-[#E8C547] uppercase md:text-xs">
                Président National AMJ-Bénin
              </p>
              <p className="mt-2 font-serif text-sm font-bold text-white md:text-base">
                Astérix GOUDEAGBE
              </p>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="h-24 w-px bg-white/20" />
            </div>

            {/* GODFATHER */}
            <div className="w-full flex-1 text-center">
              <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl md:h-36 md:w-36">
                <Image
                  src="/parrain-mandature.jpg"
                  alt="Parrain de la mandature"
                  fill
                  sizes="(max-width: 768px) 112px, 144px"
                  className="object-cover object-top"
                />
              </div>
              <p className="flex min-h-[32px] items-center justify-center text-[10px] font-bold tracking-widest text-[#E8C547] uppercase md:text-xs">
                Parrain de la mandature
              </p>
              <p className="mt-2 font-serif text-sm font-bold text-white md:text-base">
                Dr Victor ALLANONTO
              </p>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="h-24 w-px bg-white/20" />
            </div>

            {/* PREFECT */}
            <div className="w-full flex-1 text-center">
              <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl md:h-36 md:w-36">
                <Image
                  src="/prefet.jpg"
                  alt="Préfet des Jeunes"
                  fill
                  sizes="(max-width: 768px) 112px, 144px"
                  className="object-cover object-top"
                />
              </div>
              <p className="flex min-h-[32px] items-center justify-center px-2 text-[10px] font-bold tracking-widest text-[#E8C547] uppercase md:text-xs">
                Préfet des Jeunes de l’Atlantique <br /> Chargé de Mission
              </p>
              <p className="mt-2 font-serif text-sm font-bold text-white md:text-base">
                Fabrice LOKOSSOU
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOCUMENTS */}
      {(featured || others.length > 0) && (
        <section className="bg-green-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-[#E8C547] uppercase">
                  Transparence
                </p>
                <h2 className="font-serif text-4xl font-bold">Nos documents</h2>
                <p className="mt-2 text-green-300">Le plan de travail et les bilans de la mairie</p>
              </div>
              <Link
                href="/documents"
                className="text-sm tracking-widest text-[#E8C547] uppercase hover:underline"
              >
                Tous les documents →
              </Link>
            </div>

            {featured && (
              <div className="mb-8 border border-[#D4AF37] bg-green-800/50 p-6">
                <h3 className="font-serif text-2xl font-bold">{featured.title}</h3>
                <p className="mt-2 text-green-200">{featured.description}</p>
                <a
                  href={featured.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block bg-[#D4AF37] px-6 py-3 text-sm font-bold tracking-wide text-black uppercase transition hover:bg-[#b8962e]"
                >
                  Lire le document (PDF)
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {others.slice(0, 3).map((d) => (
                <a
                  key={d.id}
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-green-700 p-6 transition hover:border-[#D4AF37]"
                >
                  <h3 className="font-serif font-semibold transition group-hover:text-[#D4AF37]">
                    {d.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-green-300">{d.description}</p>
                  <p className="mt-3 text-xs text-green-400">{formatDate(d.date, DOCUMENT_DATE)}</p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* COMMUNE IDENTITY */}
      <section className="bg-[#FAFAF7] px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
              Commune de Zè
            </p>
            <h2 className="mb-6 font-serif text-4xl leading-tight font-bold text-gray-900">
              Une commune riche de sa culture et de ses ressources
            </h2>
            <p className="mb-4 text-justify leading-relaxed text-gray-600">
              Zè est reconnue pour ses cultures d’ananas, de manioc et d’huile de palme, témoins
              d’une agriculture vibrante portée par sa jeunesse. La commune abrite également des
              sites naturels et culturels d’exception : la <strong>forêt sacrée d’Assanmê</strong>,
              la <strong>forêt sacrée de Zannoudji</strong>, la <strong>forêt de Djigbé</strong>{" "}
              gérée par l’ONAB, et le célèbre <strong>marché de bétail</strong>, véritable poumon
              économique de la région.
            </p>
            <p className="mb-8 text-justify leading-relaxed text-gray-600">
              La Mairie des Jeunes s’engage à valoriser ce patrimoine naturel, culturel et
              économique pour les générations futures, à travers des actions concrètes inscrites
              dans notre Plan de Travail Annuel.
            </p>
            <Link
              href="/presentation"
              className="inline-block bg-green-800 px-8 py-3 text-sm font-semibold tracking-widest text-white uppercase transition hover:bg-green-700"
            >
              Notre mission →
            </Link>
          </div>

          {/* Grid 6 photos: 2 colums, 3 rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/culture-ananas.png"
                alt="Ananas de Zè"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/culture-palmes.png"
                alt="Palmes de Zè"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/culture-manioc.png"
                alt="Manioc de Zè"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/sites-touristiques.png"
                alt="Sites touristiques de Zè"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/foret-sacre.png"
                alt="Forêt sacrée d'Assanmê"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image
                src="/marche-de-betail.png"
                alt="Marché de bétail de Zè"
                fill
                sizes="(max-width: 768px) 50vw, 288px"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="border-t border-gray-100 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                Actualités
              </p>
              <h2 className="font-serif text-4xl font-bold text-gray-900">Dernières nouvelles</h2>
            </div>
            <Link
              href="/articles"
              className="text-sm font-semibold tracking-widest text-green-800 uppercase hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          {articles.length === 0 ? (
            <div className="border border-dashed border-gray-200 p-16 text-center text-gray-500">
              Aucune actualité publiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {articles.map((a, i) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="group">
                  <div
                    className={`h-full border border-gray-100 bg-gray-50 p-8 transition hover:border-[#D4AF37] hover:shadow-lg ${i === 0 ? "border-l-4 border-l-green-800" : ""}`}
                  >
                    <p className="mb-3 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                      Actualité
                    </p>
                    <h3 className="mb-4 font-serif text-lg leading-snug font-bold text-gray-900 transition group-hover:text-green-800">
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(a.createdAt, { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* OPPORTUNITIES */}
      {opportunities.length > 0 && (
        <section className="bg-[#FAFAF7] px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-[#8A6D1A] uppercase">
                  Jeunesse
                </p>
                <h2 className="font-serif text-4xl font-bold text-gray-900">Offres & Formations</h2>
              </div>
              <Link
                href="/opportunites"
                className="text-sm font-semibold tracking-widest text-green-800 uppercase hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {opportunities.map((o) => (
                <Link
                  key={o.id}
                  href={`/opportunites/${o.id}`}
                  className="group border border-gray-200 bg-white p-8 transition hover:border-[#D4AF37] hover:shadow-lg"
                >
                  <span
                    className={`px-2 py-1 text-xs font-bold tracking-widest uppercase ${
                      o.type === "JOB" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {o.type === "JOB" ? "Emploi" : "Formation"}
                  </span>
                  <h3 className="mt-4 mb-3 font-serif font-bold text-gray-900 transition group-hover:text-green-800">
                    {o.title}
                  </h3>
                  <p className="text-sm font-bold text-[#8A6D1A]">
                    {o.isFree ? "Gratuit" : `${formatPrice(o.price)} XOF`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
