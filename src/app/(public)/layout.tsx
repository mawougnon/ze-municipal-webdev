import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface Props {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: Props) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
