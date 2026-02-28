import { Outfit } from "next/font/google";
import "./globals.css";

const fontOutfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '600', '700', '800', '900'],
  display: 'swap',
});

// Sistem extins de Metadata pentru viralitate maximă pe Facebook/Insta/WhatsApp
export const metadata = {
  title: "Ciocnim.ro 🥚 | Tradiția Românească Online",
  description: "Alege-ți cel mai puternic ou, mișcă telefonul și sparge oul prietenilor tăi! O experiență de Paște 100% românească, direct de pe telefonul tău.",
  keywords: ["ciocnit oua", "paste", "joc paste", "ciocnim", "traditie paste", "romania", "joc multiplayer", "hristos a inviat"],
  authors: [{ name: "Ciocnim.ro Team" }],
  openGraph: {
    title: "Ciocnim.ro 🥚 | Duel de Paște",
    description: "Te provoc la un duel! Intră pe site, alege armura și hai să vedem cine are oul mai tare. Șanse 50/50!",
    url: "https://ciocnim.netlify.app",
    siteName: "Ciocnim.ro",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522881180088-25114dbd42ea?q=80&w=1200&auto=format&fit=crop", 
        width: 1200,
        height: 630,
        alt: "Ouă roșii de Paște",
      }
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro 🥚 | Tradiția de Paște",
    description: "Cine are oul mai tare? Joacă acum cu prietenii tăi online.",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false, // BLOCHEAZĂ ZOOM-UL ENERVANT
  },
  themeColor: "#991b1b",
  appleWebApp: {
    capable: true,
    title: "Ciocnim.ro",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className="bg-[#0f0000]">
      <body className={`${fontOutfit.className} antialiased text-white min-h-screen flex flex-col selection:bg-yellow-500 selection:text-black overflow-x-hidden`}>
        {/* Un container global care forteaza background-ul sa fie curat */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-red-950 via-[#0f0000] to-black"></div>
        
        {/* Aici se va randa pagina Home sau Joc */}
        <div className="flex-1 w-full h-full relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}