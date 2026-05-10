import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaFacebook, FaEnvelope, FaUsers } from "react-icons/fa";

// Footer — shown on all public pages
export default function Footer() {
  return (
    <footer className="bg-green-800 text-green-100 py-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Identity */}
        <div>
          <Image src="/logo-association-mj-ze.jpg" alt="Mairie des Jeunes de Zè" width={140} height={50} className="object-contain mb-3" />
          <p className="text-sm text-green-200">Initiative — Engagement — Développement</p>
          <p className="text-sm text-green-300 mt-1">Zè, Département de l'Atlantique, Bénin</p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-semibold text-white mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            {[
              { label: "Actualités", href: "/articles" },
              { label: "Plan de Travail Annuel", href: "/pta" },
              { label: "Présentation", href: "/presentation" },
              { label: "Opportunités", href: "/opportunites" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-white transition">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* AMJB logo */}
        <div className="flex flex-col items-start">
          <h3 className="font-semibold text-white mb-3">Membre de</h3>
          <Image src="/logo-association-mj-benin.jpg" alt="Association Mairie des Jeunes du Bénin" width={160} height={60} className="object-contain bg-white rounded-lg p-2" />
        </div>

      </div>

      <div className="flex flex-wrap justify-center gap-6 mb-6">
  
        {/* WhatsApp Personal/Business Direct Link */}
        <a href="https://wa.me/2290198704584" target="_blank" rel="noopener noreferrer"
          className="text-green-300 hover:text-white transition text-sm flex items-center gap-2">
          <FaWhatsapp className="text-lg" /> Contact Direct
        </a>

        {/* WhatsApp Channel */}
        <a href="https://whatsapp.com/channel/0029Vb7WVZXIiRovF2vgsk0t" target="_blank" rel="noopener noreferrer"
          className="text-green-300 hover:text-white transition text-sm flex items-center gap-2">
          <FaWhatsapp className="text-lg" /> Canal
        </a>

        {/* WhatsApp Group (Le lien de chat.whatsapp.com) */}
        <a href="https://chat.whatsapp.com/KvlauYJX31kHHfBZXvqllc" target="_blank" rel="noopener noreferrer"
          className="text-green-300 hover:text-white transition text-sm flex items-center gap-2">
          <FaUsers className="text-lg" /> Groupe
        </a>

        {/* Facebook Page */}
        <a href="https://www.facebook.com/profile.php?id=61587212746091" target="_blank" rel="noopener noreferrer"
          className="text-green-300 hover:text-white transition text-sm flex items-center gap-2">
          <FaFacebook className="text-lg" /> Facebook
        </a>

        {/* Email */}
        <a href="mailto:mairiedesjeunesdeze2025@gmail.com"
          className="text-green-300 hover:text-white transition text-sm flex items-center gap-2">
          <FaEnvelope className="text-lg" /> Email
        </a>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-green-700 flex justify-between items-center text-xs text-green-400">
        <p>© {new Date().getFullYear()} Mairie des Jeunes de Zè</p>
      </div>
    </footer>
  );
}
