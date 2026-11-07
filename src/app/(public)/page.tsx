import Image from "next/image";
import Link from "next/link";
import OpportunityCard from "@/components/OpportunityCard";
import { publishedDocuments } from "@/lib/documents";
import { LONG_DATE, formatDate } from "@/lib/format";
import { openOpportunitiesWhere } from "@/lib/opportunities";
import { prisma } from "@/lib/prisma";

const BUREAU = [
  { name: "Alphonse S. HOUNKANLIN", role: "1er adjoint", photo: "/adjoint1.jpg" },
  { name: "Marius SALANON", role: "Maire", photo: "/maire.jpg", lead: true },
  { name: "Josaphat M. HOUNKPE", role: "2e adjoint", photo: "/adjoint2.jpg" },
];

const AUTHORITIES = [
  {
    name: "Astérix GOUDEAGBE",
    role: "Président national de l’AMJB",
    photo: "/president-amjb-benin.jpg",
  },
  { name: "Dr Victor ALLANONTO", role: "Parrain de la mandature", photo: "/parrain-mandature.jpg" },
  {
    name: "Fabrice LOKOSSOU",
    role: "Préfet des Jeunes de l’Atlantique, chargé de mission",
    photo: "/prefet.jpg",
  },
];

const COMMUNE_PHOTOS = [
  { src: "/culture-ananas.jpg", alt: "Ananas de Zè" },
  { src: "/culture-palmes.jpg", alt: "Palmes de Zè" },
  { src: "/culture-manioc.jpg", alt: "Manioc de Zè" },
  { src: "/sites-touristiques.jpg", alt: "Sites touristiques de Zè" },
  { src: "/foret-sacre.jpg", alt: "Forêt sacrée d’Assanmê" },
  { src: "/marche-de-betail.jpg", alt: "Marché de bétail de Zè" },
];

const HERO_LOGOS = [
  { src: "/logo-association-mj-benin.jpg", alt: "AMJB", width: 128, height: 128 },
  { src: "/logo-association-mj-ze.jpg", alt: "Mairie des Jeunes de Zè", width: 192, height: 100 },
  { src: "/logo-commune-ze.jpg", alt: "Commune de Zè", width: 128, height: 128 },
];

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const { featured, others } = await publishedDocuments();

  const opportunities = await prisma.opportunity.findMany({
    where: openOpportunitiesWhere(),
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <main className="min-h-screen bg-cream">
      <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
        <Image
          src="/population-ze.jpg"
          alt="Commune de Zè"
          fill
          sizes="100vw"
          className="scale-105 object-cover"
          preload
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
          <div className="mb-6 flex items-center justify-center gap-3 md:gap-4">
            {HERO_LOGOS.map((logo, i) => (
              <div key={logo.src} className="flex items-center gap-3 md:gap-4">
                {i > 0 && <div className="h-10 w-px bg-white/30 md:h-16" />}
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width}
                  height={logo.height}
                  className={
                    logo.width === logo.height
                      ? "h-14 w-14 rounded-full bg-white object-contain p-1.5 shadow-lg md:h-24 md:w-24"
                      : "h-11 w-auto rounded-lg bg-white object-contain px-2 py-1 shadow-lg md:h-[4.5rem]"
                  }
                  preload
                />
              </div>
            ))}
          </div>

          <p className="mb-4 text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            Mandature 2025-2030
          </p>

          <h1 className="mb-4 font-serif text-3xl leading-tight font-bold md:text-6xl">
            Mairie des Jeunes
            <br />
            <span className="text-gold">de Zè</span>
          </h1>

          <p className="mb-2 text-base text-gray-200 italic md:text-xl">
            « Initiative · Engagement · Développement »
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/articles"
              className="rounded-lg bg-gold px-8 py-3 text-sm font-bold tracking-wide text-black uppercase transition hover:bg-gold-hover"
            >
              Nos actualités
            </Link>
            <Link
              href="/documents"
              className="rounded-lg border-2 border-white px-8 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-white hover:text-black"
            >
              Nos documents
            </Link>
            <Link
              href="/presentation"
              className="rounded-lg border-2 border-gold px-8 py-3 text-sm font-bold tracking-wide text-gold uppercase transition hover:bg-gold hover:text-black"
            >
              Qui sommes-nous ?
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-white/60">
          <span className="tracking-widest uppercase">Découvrir</span>
          <div className="h-8 w-px animate-pulse bg-white/40" />
        </div>
      </section>

      <section className="bg-green-800 px-6 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-8 text-sm font-medium tracking-widest text-white uppercase">
          {["Initiative", "Engagement", "Développement"].map((word, i) => (
            <span key={word} className="flex items-center gap-4">
              {i > 0 && <span className="text-gold">◆</span>}
              {word}
            </span>
          ))}
        </div>
      </section>

      <section className="bg-cream px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold tracking-widest text-gold-dark uppercase">
              Leadership
            </p>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Notre Bureau Exécutif</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-gold" />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 md:flex-row md:items-end md:gap-8">
            {BUREAU.map((member) => (
              <div
                key={member.name}
                className={`group text-center ${member.lead ? "order-first md:order-none" : ""}`}
              >
                <div
                  className={`relative mx-auto mb-4 overflow-hidden rounded-xl ${
                    member.lead
                      ? "h-60 w-48 border-4 border-gold shadow-2xl md:h-72 md:w-64"
                      : "h-44 w-36 md:h-56 md:w-48"
                  }`}
                >
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes={
                      member.lead
                        ? "(max-width: 768px) 192px, 256px"
                        : "(max-width: 768px) 144px, 192px"
                    }
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs font-semibold tracking-widest text-gold-dark uppercase">
                  {member.role}
                </p>
                <h3
                  className={`mt-1 font-serif font-bold text-gray-800 ${
                    member.lead ? "text-lg md:text-xl" : "text-sm md:text-base"
                  }`}
                >
                  {member.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-green-900 px-6 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-10 text-center text-xs font-semibold tracking-widest text-gold-light uppercase">
            Autorités de tutelle et parrainage
          </p>
          <div className="flex flex-col items-start justify-center gap-8 md:flex-row md:gap-4">
            {AUTHORITIES.map((person) => (
              <div key={person.name} className="w-full flex-1 text-center">
                <div className="relative mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-gold shadow-xl md:h-36 md:w-36">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    sizes="(max-width: 768px) 112px, 144px"
                    className="object-cover object-top"
                  />
                </div>
                <p className="flex min-h-[32px] items-center justify-center px-2 text-[10px] font-bold tracking-widest text-gold-light uppercase md:text-xs">
                  {person.role}
                </p>
                <p className="mt-2 font-serif text-sm font-bold text-white md:text-base">
                  {person.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {(featured || others.length > 0) && (
        <section className="bg-green-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-gold-light uppercase">
                  Transparence
                </p>
                <h2 className="font-serif text-4xl font-bold">Nos documents</h2>
                <p className="mt-2 text-green-300">Le plan de travail et les bilans de la mairie</p>
              </div>
              <Link
                href="/documents"
                className="text-sm tracking-widest text-gold-light uppercase hover:underline"
              >
                Tous les documents →
              </Link>
            </div>

            {featured && (
              <div className="mb-8 rounded-xl border border-gold bg-green-800/50 p-6">
                <h3 className="font-serif text-2xl font-bold">{featured.title}</h3>
                <p className="mt-2 text-green-200">{featured.description}</p>
                <a
                  href={featured.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-block rounded-lg bg-gold px-6 py-3 text-sm font-bold tracking-wide text-black uppercase transition hover:bg-gold-hover"
                >
                  Lire le document (PDF)
                </a>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {others.slice(0, 3).map((document) => (
                <a
                  key={document.id}
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-green-700 p-6 transition hover:border-gold"
                >
                  <h3 className="font-serif font-semibold transition group-hover:text-gold">
                    {document.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-green-300">{document.description}</p>
                  <p className="mt-3 text-xs text-green-300">
                    {formatDate(document.date, LONG_DATE)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-cream px-6 py-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-widest text-gold-dark uppercase">
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
              className="inline-block rounded-lg bg-green-800 px-8 py-3 text-sm font-semibold tracking-widest text-white uppercase transition hover:bg-green-700"
            >
              Notre mission →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {COMMUNE_PHOTOS.map((photo) => (
              <div key={photo.src} className="relative h-44 overflow-hidden rounded-xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 288px"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-widest text-gold-dark uppercase">
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
            <div className="rounded-xl border border-dashed border-gray-200 p-16 text-center text-gray-500">
              Aucune actualité publiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/articles/${article.id}`} className="group">
                  <div className="h-full rounded-xl border border-gray-100 bg-gray-50 p-8 transition hover:border-gold hover:shadow-lg">
                    <p className="mb-3 text-xs font-semibold tracking-widest text-gold-dark uppercase">
                      Actualité
                    </p>
                    <h3 className="mb-4 font-serif text-lg leading-snug font-bold text-gray-900 transition group-hover:text-green-800">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(article.createdAt, LONG_DATE)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {opportunities.length > 0 && (
        <section className="bg-cream px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-gold-dark uppercase">
                  Jeunesse
                </p>
                <h2 className="font-serif text-4xl font-bold text-gray-900">
                  Offres et formations
                </h2>
              </div>
              <Link
                href="/opportunites"
                className="text-sm font-semibold tracking-widest text-green-800 uppercase hover:underline"
              >
                Voir tout →
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity) => (
                <li key={opportunity.id}>
                  <OpportunityCard opportunity={opportunity} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
