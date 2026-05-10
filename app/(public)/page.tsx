import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

export default async function HomePage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // Fetch ALL activities for accurate progress calculation
  const allPtaActivities = await prisma.ptaActivity.findMany();
  
  // Only 4 most recent for display
  const ptaActivities = allPtaActivities
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  const total = allPtaActivities.length;
  const completed = allPtaActivities.filter(a => a.status === "COMPLETED").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const now = new Date();

  const opportunities = await prisma.opportunity.findMany({
    where: { 
      published: true, 
      OR: [
        { deadline: null },
        { deadline: { gte: now } } 
      ]
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return (
    <main className="min-h-screen bg-[#FAFAF7]">

      {/* ── HERO ── full viewport, site historique background */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Image src="/population-ze.png" alt="Commune de Zè" fill
          className="object-cover scale-105" priority />
        {/* Gradient overlay — dark bottom, slightly lighter top */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />

        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto">
          {/* Logos row */}
          
          <div className="flex justify-center items-center gap-3 mb-6">
            <Image src="/logo-association-mj-benin.jpg" alt="AMJB"
              width={50} height={50}
              className="rounded-full bg-white p-1 object-contain shadow-lg w-10 h-10 md:w-16 md:h-16" />
            <div className="w-px h-8 bg-white/30" />
            <Image src="/logo-association-mj-ze.jpg" alt="Mairie des Jeunes de Zè"
              width={100} height={40}
              className="bg-white rounded-lg px-2 py-1 object-contain shadow-lg h-8 w-auto md:h-12" />
            <div className="w-px h-8 bg-white/30" />
            <Image src="/logo-commune-ze.jpg" alt="Commune de Zè"
              width={50} height={50}
              className="rounded-full bg-white p-1 object-contain shadow-lg w-10 h-10 md:w-16 md:h-16" />
          </div>

          {/* Eyebrow */}
          <p className="text-[#D4AF37] font-semibold tracking-[0.3em] uppercase text-xs mb-4">
            Mandature 2025 — 2030
          </p>

          <h1 className="text-3xl md:text-6xl font-serif font-bold leading-tight mb-4">
            Mairie des Jeunes<br />
            <span className="text-[#D4AF37]">de Zè</span>
          </h1>

          <p className="text-base md:text-xl text-gray-200 mb-2 italic">
            « Initiative — Engagement — Développement »
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/articles"
              className="bg-[#D4AF37] hover:bg-[#b8962e] text-black px-8 py-3 rounded-none font-bold tracking-wide transition text-sm uppercase">
              Nos Actualités
            </Link>
            <Link href="/pta"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-none font-bold tracking-wide transition text-sm uppercase">
              Plan de Travail
            </Link>
            <Link href="/presentation"
              className="border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black px-8 py-3 rounded-none font-bold tracking-wide transition text-sm uppercase">
              Qui sommes-nous ?
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 text-xs">
          <span className="tracking-widest uppercase">Découvrir</span>
          <div className="w-px h-8 bg-white/40 animate-pulse" />
        </div>
      </section>

      {/* ── DEVISE BAND ── */}
      <section className="bg-green-800 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-8 text-white text-sm font-medium tracking-widest uppercase">
          {["Initiative", "Engagement", "Développement"].map((word, i) => (
            <span key={word} className="flex items-center gap-4">
              {i > 0 && <span className="text-[#D4AF37]">◆</span>}
              {word}
            </span>
          ))}
        </div>
      </section>

      {/* ── BUREAU ── Bigger size for the mayor */}
      <section className="py-20 px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">Leadership</p>
            <h2 className="text-4xl font-serif font-bold text-gray-900">Notre Bureau Exécutif</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4" />
          </div>

          {/* Layout : deputy1 | Maire (bigger) | deputy2 */}
          <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 md:gap-8">

            {/* 1er Adjoint */}
            <div className="text-center group order-2 md:order-1">
              <div className="relative w-36 h-44 md:w-48 md:h-56 mx-auto mb-4 overflow-hidden">
                <Image src="/adjoint1.jpg" alt="Hounkanlin Sèïgbénan Alphonse" fill
                  sizes="(max-width: 768px) 144px, 192px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold">1er Adjoint</p>
              <h3 className="font-serif font-bold text-gray-800 mt-1 text-sm md:text-base px-2">
                Alphonse S. HOUNKANLIN
              </h3>
            </div>

            {/* Mayor — center */}
            <div className="text-center group order-1 md:order-2">
              <div className="relative w-48 h-60 md:w-64 md:h-72 mx-auto mb-4 overflow-hidden border-4 border-[#D4AF37] shadow-2xl">
                <Image src="/maire.jpg" alt="Marius Salanon" fill
                  sizes="(max-width: 768px) 192px, 256px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 uppercase tracking-widest">
                    Maire
                  </span>
                </div>
              </div>
              <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">Maire</p>
              <h3 className="font-serif font-bold text-gray-800 text-lg md:text-xl mt-1">Marius SALANON</h3>
            </div>
      
            <div className="text-center group order-3">
              <div className="relative w-36 h-44 md:w-48 md:h-56 mx-auto mb-4 overflow-hidden">
                <Image src="/adjoint2.jpg" alt="Josaphat Hounkpe" fill
                  sizes="(max-width: 768px) 144px, 192px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold">2e Adjoint</p>
              <h3 className="font-serif font-bold text-gray-800 mt-1 text-sm md:text-base">Josaphat M. HOUNKPE</h3>
            </div>

          </div>
        </div>
      </section>

      {/* ── AMJB PRESIDENT & THE GODFATHER ── */}
      <section className="py-12 px-6 bg-green-900 text-white">
        <div className="max-w-6xl mx-auto"> {/* Augmenté à 6xl pour plus d'espace */}
          <div className="text-center mb-10">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">
              Autorités de Tutelle & Parrainage
            </p>
          </div>
          
          
          <div className="flex flex-col md:flex-row items-start justify-center gap-8 md:gap-4">
            
            {/* PRESIDENT */}
            <div className="flex-1 w-full text-center">
              <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-4 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl">
                <Image src="/president-amjb-benin.jpg" alt="Président AMJB Bénin" fill
                  className="object-cover object-top" />
              </div>
              <p className="text-[#D4AF37] text-[10px] md:text-xs uppercase tracking-widest font-bold min-h-[32px] flex items-center justify-center">
                Président National AMJ-Bénin
              </p>
              <p className="text-white text-sm md:text-base font-serif font-bold mt-2">
                Astérix GOUDEAGBE
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="w-px h-24 bg-white/20" />
            </div>

            {/* GODFATHER */}
            <div className="flex-1 w-full text-center">
              <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-4 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl">
                <Image src="/parrain-mandature.jpg" alt="Parrain de la mandature" fill
                  className="object-cover object-top" />
              </div>
              <p className="text-[#D4AF37] text-[10px] md:text-xs uppercase tracking-widest font-bold min-h-[32px] flex items-center justify-center">
                Parrain de la mandature
              </p>
              <p className="text-white text-sm md:text-base font-serif font-bold mt-2">
                Dr Victor ALLANONTO
              </p>
            </div>

            <div className="hidden md:flex items-center justify-center">
              <div className="w-px h-24 bg-white/20" />
            </div>

            {/* PREFECT */}
            <div className="flex-1 w-full text-center">
              <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto mb-4 overflow-hidden rounded-full border-2 border-[#D4AF37] shadow-xl">
                <Image src="/prefet.jpg" alt="Préfet des Jeunes" fill
                  className="object-cover object-top" />
              </div>
              <p className="text-[#D4AF37] text-[10px] md:text-xs uppercase tracking-widest font-bold min-h-[32px] flex items-center justify-center px-2">
                Préfet des Jeunes de l’Atlantique <br /> — Chargé de Mission —
              </p>
              <p className="text-white text-sm md:text-base font-serif font-bold mt-2">
                Fabrice LOKOSSOU
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PTA PROGRESS ── */}
      <section className="py-20 px-6 bg-green-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">Transparence</p>
              <h2 className="text-4xl font-serif font-bold">Plan de Travail Annuel</h2>
              <p className="text-green-300 mt-2">Mandature 2025–2030 · Suivi en temps réel</p>
            </div>
            <Link href="/pta" className="text-[#D4AF37] hover:underline text-sm uppercase tracking-widest">
              Voir tout le PTA →
            </Link>
          </div>

          {/* Progress bar */}
          <div className="bg-green-800/50 rounded-none p-6 mb-8 border border-green-700">
            <div className="flex justify-between mb-3">
              <span className="font-semibold text-green-100">Progression globale</span>
              <span className="font-bold text-[#D4AF37] text-xl">{progress}%</span>
            </div>
            <div className="w-full bg-green-950 h-2">
              <div className="bg-[#D4AF37] h-2 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-green-400 text-sm mt-3">{completed} activité(s) terminée(s) sur {total}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ptaActivities.map((a) => (
              <div key={a.id} className="border border-green-700 p-6 hover:border-[#D4AF37] transition group">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-serif font-semibold text-white group-hover:text-[#D4AF37] transition">{a.title}</h3>
                  <span className={`text-xs px-2 py-1 shrink-0 font-bold uppercase tracking-wide ${
                    a.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                    a.status === "CANCELLED" ? "bg-red-500/20 text-red-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {a.status === "COMPLETED" ? "Terminé" : a.status === "CANCELLED" ? "Annulé" : "En cours"}
                  </span>
                </div>
                <p className="text-green-300 text-sm mt-2 line-clamp-2">{a.description}</p>
                <p className="text-green-500 text-xs mt-3">Année {a.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNE IDENTITY ── */}
      <section className="py-20 px-6 bg-[#FAFAF7]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-3">
              Commune de Zè
            </p>
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
              Une commune riche de sa culture et de ses ressources
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4 text-justify">
              Zè est reconnue pour ses cultures d'ananas, de manioc et d'huile de palme, 
              témoins d'une agriculture vibrante portée par sa jeunesse. La commune abrite 
              également des sites naturels et culturels d'exception : la <strong>forêt sacrée d'Assanmê</strong>, la <strong>forêt sacrée de Zannoudji</strong>, 
              la <strong>forêt de Djigbé</strong> gérée par l'ONAB, et le célèbre <strong>marché de bétail</strong>, 
              véritable poumon économique de la région.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8 text-justify">
              La Mairie des Jeunes s'engage à valoriser ce patrimoine naturel, culturel et 
              économique pour les générations futures, à travers des actions concrètes 
              inscrites dans notre Plan de Travail Annuel.
            </p>
            <Link href="/presentation"
              className="bg-green-800 text-white px-8 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-green-700 transition inline-block">
              Notre mission →
            </Link>
          </div>

          {/* Grid 6 photos — 2 colums, 3 rows */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative h-44 overflow-hidden">
              <Image src="/culture-ananas.png" alt="Ananas de Zè" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image src="/culture-palmes.png" alt="Palmes de Zè" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image src="/culture-manioc.png" alt="Manioc de Zè" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image src="/sites-touristiques.png" alt="Sites touristiques de Zè" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image src="/foret-sacre.png" alt="Forêt sacrée d'Assanmê" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="relative h-44 overflow-hidden">
              <Image src="/marche-de-betail.png" alt="Marché de bétail de Zè" fill
                className="object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">Actualités</p>
              <h2 className="text-4xl font-serif font-bold text-gray-900">Dernières nouvelles</h2>
            </div>
            <Link href="/articles" className="text-green-800 hover:underline text-sm uppercase tracking-widest font-semibold">
              Voir tout →
            </Link>
          </div>
          {articles.length === 0 ? (
            <div className="border border-dashed border-gray-200 p-16 text-center text-gray-400">
              Aucune actualité publiée pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((a, i) => (
                <Link key={a.id} href={`/articles/${a.id}`} className="group">
                  <div className={`bg-gray-50 border border-gray-100 p-8 h-full hover:border-[#D4AF37] hover:shadow-lg transition ${i === 0 ? "border-l-4 border-l-green-800" : ""}`}>
                    <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-semibold mb-3">Actualité</p>
                    <h3 className="font-serif font-bold text-gray-900 text-lg mb-4 group-hover:text-green-800 transition leading-snug">{a.title}</h3>
                    <p className="text-gray-400 text-sm">{new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── OPPORTUNITIES ── */}
      {opportunities.length > 0 && (
        <section className="py-20 px-6 bg-[#FAFAF7]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">Jeunesse</p>
                <h2 className="text-4xl font-serif font-bold text-gray-900">Offres & Formations</h2>
              </div>
              <Link href="/opportunites" className="text-green-800 hover:underline text-sm uppercase tracking-widest font-semibold">
                Voir tout →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {opportunities.map((o) => (
                <Link key={o.id} href={`/opportunites/${o.id}`}
                  className="group border border-gray-200 bg-white p-8 hover:border-[#D4AF37] hover:shadow-lg transition">
                  <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 ${
                    o.type === "JOB" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                  }`}>
                    {o.type === "JOB" ? "Emploi" : "Formation"}
                  </span>
                  <h3 className="font-serif font-bold text-gray-900 mt-4 mb-3 group-hover:text-green-800 transition">{o.title}</h3>
                  <p className="text-[#D4AF37] font-bold text-sm">{o.isFree ? "Gratuit" : `${o.price?.toLocaleString()} XOF`}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}