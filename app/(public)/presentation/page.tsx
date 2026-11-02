import Link from "next/link";
import Image from "next/image";

// Static presentation page: mission, vision, values, history
export default function PresentationPage() {
  const valeurs = [
    {
      titre: "Engagement citoyen",
      desc: "Implication active des jeunes dans la vie de la communauté.",
    },
    {
      titre: "Responsabilité",
      desc: "Sens du devoir et respect des principes de bonne gouvernance.",
    },
    { titre: "Leadership", desc: "Capacité à initier et conduire des actions de développement." },
    { titre: "Solidarité", desc: "Esprit d'entraide et de cohésion sociale." },
    { titre: "Intégrité", desc: "Transparence et éthique dans la gestion des actions." },
    {
      titre: "Développement durable",
      desc: "Promotion d'actions respectueuses de l'environnement.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Hero */}
      <section className="relative flex h-64 items-center justify-center overflow-hidden bg-green-900">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/sites-touristiques.png"
            alt="Sites touristiques de Zè"
            fill
            className="object-cover"
            preload
          />
        </div>
        <div className="relative z-10 px-6 text-center text-white">
          <p className="mb-3 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
            Qui sommes-nous
          </p>
          <h1 className="font-serif text-4xl font-bold">Présentation</h1>
        </div>
      </section>

      {/* Welcome text */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-16 border-l-4 border-[#D4AF37] pl-8">
          <p className="text-lg leading-relaxed text-gray-700 italic">
            Bienvenue sur la plateforme officielle de la Mairie des Jeunes de la Commune de Zè,
            représentation locale de l'Association Mairie des Jeunes du Bénin (AMJB), organisation
            reconnue comme
            <strong> une école d'apprentissage de la gestion du pouvoir public</strong>.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Autorisation n°2021/029/PDO/SG/SAG/SA du 10 mai 2021
          </p>
        </div>

        <p className="mb-6 leading-relaxed text-gray-600">
          La Mairie des Jeunes de Zè s'inscrit dans une dynamique de formation, d'engagement citoyen
          et de participation active des jeunes au développement local. Dans le cadre du mandat
          2025-2030, le Bureau Exécutif Communal de Zè se positionne comme un acteur clé de
          mobilisation, d'encadrement et de valorisation des initiatives portées par les jeunes au
          sein de la commune.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="bg-green-900 px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Notre Mission
            </p>
            <h2 className="mb-6 font-serif text-3xl font-bold">Ce que nous faisons</h2>
            <ul className="space-y-4">
              {[
                "Promouvoir la participation active des jeunes à la vie citoyenne et à la gouvernance locale",
                "Accompagner les initiatives de développement communautaire",
                "Sensibiliser les populations sur les enjeux sociaux, éducatifs et environnementaux",
                "Renforcer les capacités des jeunes en matière de leadership et d'engagement citoyen",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-green-100">
                  <span className="mt-1 shrink-0 text-[#D4AF37]">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Notre Vision
            </p>
            <h2 className="mb-6 font-serif text-3xl font-bold">Ce que nous voulons devenir</h2>
            <p className="leading-relaxed text-green-100">
              La Mairie des Jeunes de Zè ambitionne de devenir un cadre de référence en matière
              d'engagement et de gouvernance participative des jeunes, contribuant efficacement à un
              développement local inclusif, durable et porté par une jeunesse responsable et
              engagée.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
              Ce en quoi nous croyons
            </p>
            <h2 className="font-serif text-4xl font-bold text-gray-900">Nos Valeurs</h2>
            <div className="mx-auto mt-4 h-1 w-16 bg-[#D4AF37]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {valeurs.map((v) => (
              <div
                key={v.titre}
                className="border border-gray-100 p-8 transition hover:border-[#D4AF37] hover:shadow-md"
              >
                <p className="mb-3 text-xs font-bold tracking-widest text-[#D4AF37] uppercase">◆</p>
                <h3 className="mb-2 font-serif text-lg font-bold text-gray-900">{v.titre}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Devise */}
      <section className="bg-[#D4AF37] px-6 py-12 text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-black/60 uppercase">
          Notre Devise
        </p>
        <h2 className="font-serif text-4xl font-bold text-black">
          Initiative · Engagement · Développement
        </h2>
      </section>

      {/* Logos */}
      <section className="bg-[#FAFAF7] px-6 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-12">
          <Image
            src="/logo-association-mj-benin.jpg"
            alt="AMJB"
            width={160}
            height={80}
            className="object-contain"
          />
          <Image
            src="/logo-association-mj-ze.jpg"
            alt="Mairie des Jeunes de Zè"
            width={200}
            height={80}
            className="object-contain"
          />
          <Image
            src="/logo-commune-ze.jpg"
            alt="Commune de Zè"
            width={100}
            height={100}
            className="object-contain"
          />
        </div>
      </section>

      <div className="pb-12 text-center">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
