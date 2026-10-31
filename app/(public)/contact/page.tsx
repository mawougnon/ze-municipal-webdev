import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaFacebook, FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaUsers, FaBullhorn } from "react-icons/fa";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7]">

      {/* Hero */}
      <section className="bg-green-900 text-white py-16 px-6 text-center">
        <p className="text-[#D4AF37] uppercase tracking-widest text-xs font-semibold mb-3">
          Nous contacter
        </p>
        <h1 className="text-4xl font-serif font-bold">Contact</h1>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Contact info */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">
            Coordonnées
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FaPhoneAlt className="text-xl text-green-700 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <a href="tel:+2290198704584"
                  className="text-green-700 hover:underline">
                  +229 01 98 70 45 84
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaEnvelope className="text-xl text-green-700 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <a href="mailto:mairiedesjeunesdeze2025@gmail.com"
                  className="text-green-700 hover:underline break-all">
                  mairiedesjeunesdeze2025@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="text-xl text-green-700 mt-1" />
              <div>
                <p className="font-semibold text-gray-800">Adresse</p>
                <p className="text-gray-600">Zè, Département de l'Atlantique, Bénin</p>
              </div>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-10">
            <h3 className="font-semibold text-gray-800 mb-4">Suivez-nous</h3>
            <div className="flex flex-wrap gap-3">
              {/* WhatsApp Direct */}
              <a href="https://wa.me/2290198704584" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition text-xs font-medium">
                <FaWhatsapp className="text-base" /> WhatsApp
              </a>

              {/* WhatsApp Channel */}
              <a href="https://whatsapp.com/channel/0029Vb7WVZXIiRovF2vgsk0t" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-800 text-white px-3 py-2 rounded-lg hover:bg-green-900 transition text-xs font-medium">
                <FaBullhorn className="text-base" /> Canal
              </a>

              {/* WhatsApp Group */}
              <a href="https://chat.whatsapp.com/KvlauYJX31kHHfBZXvqllc" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition text-xs font-medium">
                <FaUsers className="text-base" /> Groupe
              </a>

              {/* Facebook */}
              <a href="https://www.facebook.com/profile.php?id=61587212746091" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 transition text-xs font-medium">
                <FaFacebook className="text-base" /> Facebook
              </a>
            </div>
          </div>
        </div>

        {/* Write to us: opens the visitor's own mail app or WhatsApp, nothing is lost on the way */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col justify-center">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-3">
            Nous écrire
          </h2>
          <p className="text-gray-600 text-sm mb-6">
            Une question, une proposition de partenariat ? Écrivez-nous directement, nous vous répondrons.
          </p>
          <a href="mailto:mairiedesjeunesdeze2025@gmail.com"
            className="flex items-center justify-center gap-2 w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 transition">
            <FaEnvelope /> Envoyer un e-mail
          </a>
          <a href="https://wa.me/2290198704584" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mt-3 border border-green-700 text-green-700 py-3 rounded-lg font-semibold hover:bg-green-50 transition">
            <FaWhatsapp /> Écrire sur WhatsApp
          </a>
        </div>

      </section>
    </main>
  );
}
