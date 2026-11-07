import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
// Import the TopLoader component
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
  // Reading the request renders every page per request, which the CSP nonce requires:
  // a page built in advance could not carry the nonce of the request being served.
  await headers();

  return (
    <html lang="fr" className="scroll-smooth">
      <body className={geist.className}>
        {/* 
          NextTopLoader provides a visual progress bar at the top of the page 
          during route changes, giving the user instant feedback.
        */}
        <NextTopLoader
          color="#D4AF37" // Matching your branding gold color
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false} // Keeping it clean by only showing the bar
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />

        {children}
      </body>
    </html>
  );
}
