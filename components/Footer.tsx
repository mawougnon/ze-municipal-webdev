import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaFacebook, FaEnvelope, FaUsers } from "react-icons/fa";

// Footer: shown on all public pages
export default function Footer() {
  return (
    <footer className="bg-green-800 px-6 py-10 text-green-100">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {/* Identity */}
        <div>
          <Image
            src="/logo-association-mj-ze.jpg"
            alt="Mairie des Jeunes de Zè"
            width={140}
            height={50}
            className="mb-3 object-contain"
          />
          <p className="text-sm text-green-200">Initiative · Engagement · Développement</p>
          <p className="mt-1 text-sm text-green-300">Zè, Département de l’Atlantique, Bénin</p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="mb-3 font-semibold text-white">Navigation</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Actualités", href: "/articles" },
              { label: "Documents", href: "/documents" },
              { label: "Présentation", href: "/presentation" },
              { label: "Opportunités", href: "/opportunites" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AMJB logo */}
        <div className="flex flex-col items-start">
          <h3 className="mb-3 font-semibold text-white">Membre de</h3>
          <Image
            src="/logo-association-mj-benin.jpg"
            alt="Association Mairie des Jeunes du Bénin"
            width={160}
            height={60}
            className="rounded-lg bg-white object-contain p-2"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-6">
        {/* WhatsApp Personal/Business Direct Link */}
        <a
          href="https://wa.me/2290198704584"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-300 transition hover:text-white"
        >
          <FaWhatsapp className="text-lg" /> Contact Direct
        </a>

        {/* WhatsApp Channel */}
        <a
          href="https://whatsapp.com/channel/0029Vb7WVZXIiRovF2vgsk0t"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-300 transition hover:text-white"
        >
          <FaWhatsapp className="text-lg" /> Canal
        </a>

        {/* WhatsApp Group (Le lien de chat.whatsapp.com) */}
        <a
          href="https://chat.whatsapp.com/KvlauYJX31kHHfBZXvqllc"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-300 transition hover:text-white"
        >
          <FaUsers className="text-lg" /> Groupe
        </a>

        {/* Facebook Page */}
        <a
          href="https://www.facebook.com/profile.php?id=61587212746091"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-green-300 transition hover:text-white"
        >
          <FaFacebook className="text-lg" /> Facebook
        </a>

        {/* Email */}
        <a
          href="mailto:mairiedesjeunesdeze2025@gmail.com"
          className="flex items-center gap-2 text-sm text-green-300 transition hover:text-white"
        >
          <FaEnvelope className="text-lg" /> Email
        </a>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-green-700 pt-6 text-xs text-green-300">
        <p>© {new Date().getFullYear()} Mairie des Jeunes de Zè</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/mentions-legales" className="hover:text-white">
            Mentions légales
          </Link>
          <Link href="/confidentialite" className="hover:text-white">
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </footer>
  );
}
