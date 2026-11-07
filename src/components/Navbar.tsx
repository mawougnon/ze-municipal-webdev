import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-benin.png"
            alt="Mairie des Jeunes de Zè"
            width={55}
            height={48}
            className="h-10 w-auto object-contain md:h-12"
            loading="eager"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
          <Link href="/" className="transition hover:text-green-700">
            Accueil
          </Link>
          <Link href="/articles" className="transition hover:text-green-700">
            Actualités
          </Link>
          <Link href="/documents" className="transition hover:text-green-700">
            Documents
          </Link>
          <Link href="/presentation" className="transition hover:text-green-700">
            Présentation
          </Link>
          <Link href="/opportunites" className="transition hover:text-green-700">
            Opportunités
          </Link>
          <Link href="/contact" className="transition hover:text-green-700">
            Contact
          </Link>
        </nav>

        <Image
          src="/logo-commune-ze.jpg"
          alt="Commune de Zè"
          width={48}
          height={48}
          className="h-10 w-auto object-contain md:h-12"
          loading="eager"
        />
      </div>

      <div className="scrollbar-hide flex gap-5 overflow-x-auto border-t border-gray-100 px-4 py-2 text-xs font-medium whitespace-nowrap text-gray-500 md:hidden">
        <Link href="/" className="shrink-0 hover:text-green-700">
          Accueil
        </Link>
        <Link href="/articles" className="shrink-0 hover:text-green-700">
          Actualités
        </Link>
        <Link href="/documents" className="shrink-0 hover:text-green-700">
          Documents
        </Link>
        <Link href="/presentation" className="shrink-0 hover:text-green-700">
          Présentation
        </Link>
        <Link href="/opportunites" className="shrink-0 hover:text-green-700">
          Opportunités
        </Link>
        <Link href="/contact" className="shrink-0 hover:text-green-700">
          Contact
        </Link>
      </div>
    </header>
  );
}
