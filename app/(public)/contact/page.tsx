import Link from "next/link";
import Image from "next/image";
import {
  FaWhatsapp,
  FaFacebook,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUsers,
  FaBullhorn,
} from "react-icons/fa";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Hero */}
      <section className="bg-green-900 px-6 py-16 text-center text-white">
        <p className="mb-3 text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
          Nous contacter
        </p>
        <h1 className="font-serif text-4xl font-bold">Contact</h1>
      </section>

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2">
        {/* Contact info */}
        <div>
          <h2 className="mb-8 font-serif text-2xl font-bold text-gray-900">Coordonnées</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FaPhoneAlt className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <a href="tel:+2290198704584" className="text-green-700 hover:underline">
                  +229 01 98 70 45 84
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaEnvelope className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <a
                  href="mailto:mairiedesjeunesdeze2025@gmail.com"
                  className="break-all text-green-700 hover:underline"
                >
                  mairiedesjeunesdeze2025@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Adresse</p>
                <p className="text-gray-600">Zè, Département de l'Atlantique, Bénin</p>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-10">
            <h3 className="mb-4 font-semibold text-gray-800">Suivez-nous</h3>
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp Direct */}
              <a
                href="https://wa.me/2290198704584"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
              >
                <FaWhatsapp className="text-base" /> WhatsApp
              </a>

              {/* WhatsApp Channel */}
              <a
                href="https://whatsapp.com/channel/0029Vb7WVZXIiRovF2vgsk0t"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-900"
              >
                <FaBullhorn className="text-base" /> Canal
              </a>

              {/* WhatsApp Group */}
              <a
                href="https://chat.whatsapp.com/KvlauYJX31kHHfBZXvqllc"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
              >
                <FaUsers className="text-base" /> Groupe
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/profile.php?id=61587212746091"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-800"
              >
                <FaFacebook className="text-base" /> Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Write to us: opens the visitor's own mail app or WhatsApp, nothing is lost on the way */}
        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-3 font-serif text-xl font-bold text-gray-900">Nous écrire</h2>
          <p className="mb-6 text-sm text-gray-600">
            Une question, une proposition de partenariat ? Écrivez-nous directement, nous vous
            répondrons.
          </p>
          <a
            href="mailto:mairiedesjeunesdeze2025@gmail.com"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            <FaEnvelope /> Envoyer un e-mail
          </a>
          <a
            href="https://wa.me/2290198704584"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-green-700 py-3 font-semibold text-green-700 transition hover:bg-green-50"
          >
            <FaWhatsapp /> Écrire sur WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
