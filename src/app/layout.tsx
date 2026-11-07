import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import NextTopLoader from "nextjs-toploader";

const geist = Geist({ subsets: ["latin"] });

const description =
  "Site officiel de la Mairie des Jeunes de Zè : actualités, documents, offres et formations.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mairie des Jeunes de Zè", template: "%s | Mairie des Jeunes de Zè" },
  description,
  openGraph: {
    siteName: "Mairie des Jeunes de Zè",
    title: "Mairie des Jeunes de Zè",
    description,
    locale: "fr_FR",
    type: "website",
    images: ["/og.jpg"],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Forces dynamic rendering: every page needs the nonce of its request
  await headers();

  return (
    <html lang="fr" className="scroll-smooth">
      <body className={geist.className}>
        <NextTopLoader
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />

        {children}
      </body>
    </html>
  );
}
