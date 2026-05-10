import Link from "next/link";
import Image from "next/image";

// Static presentation page — mission, vision, values, history
export default function PresentationPage() {
  const valeurs = [
    { titre: "Engagement citoyen", desc: "Implication active des jeunes dans la vie de la communauté." },
    { titre: "Responsabilité", desc: "Sens du devoir et respect des principes de bonne gouvernance." },
    { titre: "Leadership", desc: "Capacité à initier et conduire des actions de développement." },
    { titre: "Solidarité", desc: "Esprit d'entraide et de cohésion sociale." },
    { titre: "Intégrité", desc: "Transparence et éthique dans la gestion des actions." },
    { titre: "Développement durable", desc: "Promotion d'actions respectueuses de l'environnement." },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF7]">

      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden bg-green-900">
        <div className="absolute inset-0 opacity-20">
          <Image src="/Sites-touristique.jpg" alt="" fill className="object-cover" />
        </div>
        <div className="relative z-10 text-center text-white px-6">
          <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-3">Qui sommes-nous</p>
          <h1 className="text-4xl font-serif font-bold">Présentation</h1>
        </div>
      </section>

      {/* Welcome text */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="border-l-4 border-[#D4AF37] pl-8 mb-16">
          <p className="text-lg text-gray-700 leading-relaxed italic">
            Bienvenue sur la plateforme officielle de la Mairie des Jeunes de la Commune de Zè, 
            représentation locale de l'Association Mairie des Jeunes du Bénin (AMJB), organisation reconnue comme 
            <strong> une école d'apprentissage de la gestion du pouvoir public</strong>.
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Autorisation n°2021/029/PDO/SG/SAG/SA du 10 mai 2021
          </p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-6">
          La Mairie des Jeunes de Zè s'inscrit dans une dynamique de formation, d'engagement citoyen et de 
          participation active des jeunes au développement local. Dans le cadre du mandat 2025-2030, le 
          Bureau Exécutif Communal de Zè se positionne comme un acteur clé de mobilisation, d'encadrement 
          et de valorisation des initiatives portées par les jeunes au sein de la commune.
        </p>
      </section>

      {/* Mission & Vision */}
      <section className="bg-green-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-4">Notre Mission</p>
            <h2 className="text-3xl font-serif font-bold mb-6">Ce que nous faisons</h2>
            <ul className="space-y-4">
              {[
                "Promouvoir la participation active des jeunes à la vie citoyenne et à la gouvernance locale",
                "Accompagner les initiatives de développement communautaire",
                "Sensibiliser les populations sur les enjeux sociaux, éducatifs et environnementaux",
                "Renforcer les capacités des jeunes en matière de leadership et d'engagement citoyen",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-green-100">
                  <span className="text-[#D4AF37] mt-1 shrink-0">◆</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-4">Notre Vision</p>
            <h2 className="text-3xl font-serif font-bold mb-6">Ce que nous voulons devenir</h2>
            <p className="text-green-100 leading-relaxed">
              La Mairie des Jeunes de Zè ambitionne de devenir un cadre de référence en matière d'engagement 
              et de gouvernance participative des jeunes, contribuant efficacement à un développement local 
              inclusif, durable et porté par une jeunesse responsable et engagée.
            </p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-2">Ce en quoi nous croyons</p>
            <h2 className="text-4xl font-serif font-bold text-gray-900">Nos Valeurs</h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valeurs.map((v) => (
              <div key={v.titre} className="border border-gray-100 p-8 hover:border-[#D4AF37] hover:shadow-md transition">
                <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-xs mb-3">◆</p>
                <h3 className="font-serif font-bold text-gray-900 text-lg mb-2">{v.titre}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Devise */}
      <section className="bg-[#D4AF37] py-12 px-6 text-center">
        <p className="text-black/60 uppercase tracking-widest text-xs font-semibold mb-3">Notre Devise</p>
        <h2 className="text-4xl font-serif font-bold text-black">
          Initiative — Engagement — Développement
        </h2>
      </section>

      {/* Logos */}
      <section className="py-12 px-6 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center items-center gap-12">
          <Image src="/logo-association-MJ-Benin.jpg" alt="AMJB" width={160} height={80} className="object-contain" />
          <Image src="/logo-association-MJ-Ze.jpg" alt="Mairie des Jeunes de Zè" width={200} height={80} className="object-contain" />
          <Image src="/logo-commune-Ze.jpg" alt="Commune de Zè" width={100} height={100} className="object-contain" />
        </div>
      </section>

      <div className="text-center pb-12">
        <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">← Retour à l'accueil</Link>
      </div>
    </main>
  );
}