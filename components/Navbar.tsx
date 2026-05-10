import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">

        {/* Logo gauche */}
        <Link href="/" className="flex items-center">
          <Image src="/logo-benin.png" alt="Mairie des Jeunes de Zè"
            width={120} height={48}
            className="object-contain h-10 md:h-12 w-auto" />
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-green-700 transition">Accueil</Link>
          <Link href="/articles" className="hover:text-green-700 transition">Actualités</Link>
          <Link href="/pta" className="hover:text-green-700 transition">PTA</Link>
          <Link href="/presentation" className="hover:text-green-700 transition">Présentation</Link>
          <Link href="/opportunites" className="hover:text-green-700 transition">Opportunités</Link>
          <Link href="/contact" className="hover:text-green-700 transition">Contact</Link>
        </nav>

        {/* Logo droite */}
        <Image src="/logo-commune-ze.jpg" alt="Commune de Zè"
          width={100} height={50}
          className="object-contain h-10 md:h-12 w-auto" />
      </div>

      {/* Navigation mobile — barre scrollable */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2 flex gap-5 overflow-x-auto text-xs font-medium text-gray-500 whitespace-nowrap scrollbar-hide">
        <Link href="/" className="hover:text-green-700 shrink-0">Accueil</Link>
        <Link href="/articles" className="hover:text-green-700 shrink-0">Actualités</Link>
        <Link href="/pta" className="hover:text-green-700 shrink-0">PTA</Link>
        <Link href="/presentation" className="hover:text-green-700 shrink-0">Présentation</Link>
        <Link href="/opportunites" className="hover:text-green-700 shrink-0">Opportunités</Link>
        <Link href="/contact" className="hover:text-green-700 shrink-0">Contact</Link>
      </div>
    </header>
  );
}