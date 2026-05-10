import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Layout for all public pages — includes navbar and footer
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}