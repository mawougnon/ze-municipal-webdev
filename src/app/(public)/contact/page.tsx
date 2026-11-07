import type { Metadata } from "next";
import {
  FaWhatsapp,
  FaFacebook,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaUsers,
  FaBullhorn,
} from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import { CONTACT } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Comment joindre la Mairie des Jeunes de Zè.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-cream">
      <PageHeader title="Contact" eyebrow="Nous contacter" />

      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <h2 className="mb-8 font-serif text-2xl font-bold text-gray-900">Coordonnées</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <FaPhoneAlt className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Téléphone</p>
                <a href={CONTACT.phoneHref} className="text-green-700 hover:underline">
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaEnvelope className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Email</p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="break-all text-green-700 hover:underline"
                >
                  {CONTACT.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="mt-1 text-xl text-green-700" />
              <div>
                <p className="font-semibold text-gray-800">Adresse</p>
                <p className="text-gray-600">{CONTACT.address}</p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h3 className="mb-4 font-semibold text-gray-800">Suivez-nous</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={CONTACT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-700"
              >
                <FaWhatsapp className="text-base" /> WhatsApp
              </a>

              <a
                href={CONTACT.whatsappChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-green-800 px-3 py-2 text-xs font-medium text-white transition hover:bg-green-900"
              >
                <FaBullhorn className="text-base" /> Canal
              </a>

              <a
                href={CONTACT.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-800"
              >
                <FaUsers className="text-base" /> Groupe
              </a>

              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-800"
              >
                <FaFacebook className="text-base" /> Facebook
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-3 font-serif text-xl font-bold text-gray-900">Nous écrire</h2>
          <p className="mb-6 text-sm text-gray-600">
            Une question, une proposition de partenariat ? Écrivez-nous directement, nous vous
            répondrons.
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800"
          >
            <FaEnvelope /> Envoyer un email
          </a>
          <a
            href={CONTACT.whatsapp}
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
