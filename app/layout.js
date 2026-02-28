import { Outfit } from "next/font/google";
import "./globals.css";

// Font modern și curat
const fontOutfit = Outfit({ 
  subsets: ["latin"],
  weight: ['300', '400', '600', '700', '800', '900'],
  display: 'swap',
});

// ==========================================
// CONFIGURARE SEO SUPREMĂ (BOMBĂ PENTRU GOOGLE)
// ==========================================
export const metadata = {
  title: "Ciocnim.ro 🥚 | Jocul de Paște: Ciocnit Ouă Online",
  description: "Tradiția de Paște s-a mutat pe telefon! Hai să vedem care e mai tare în coajă. Intră, alege-ți oul, mișcă telefonul și ciocnește online cu prietenii. Șanse 50/50!",
  keywords: [
    "ciocnit oua", "paste 2024", "paste 2025", "joc paste", 
    "ciocnim oua online", "traditii paste romania", "hristos a inviat", 
    "joc multiplayer paste", "oua rosii", "ciocneste ou", "ciocnim.ro"
  ],
  authors: [{ name: "Echipa Ciocnim.ro" }],
  creator: "Ciocnim.ro",
  publisher: "Ciocnim.ro",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    title: "Ciocnim.ro 🥚 | Hai să ciocnim un ou!",
    description: "Crezi că oul tău e mai puternic? Te provoc la un duel tradițional de Paște online. Dă click, alege armura și lovește!",
    url: "https://ciocnim.netlify.app",
    siteName: "Ciocnim.ro",
    images: [{
      url: "https://images.unsplash.com/photo-1522881180088-25114dbd42ea?q=80&w=1200&auto=format&fit=crop", 
      width: 1200, height: 630, alt: "Ouă roșii de Paște ciocnindu-se",
    }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro 🥚 | Ciocnește Ouă Online",
    description: "Cine are oul mai tare? Joacă acum cu prietenii tăi online.",
  },
  viewport: { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false },
  themeColor: "#450a0a", // Roșu închis pentru bara browserului
  appleWebApp: { capable: true, title: "Ciocnim", statusBarStyle: "black-translucent" },
};

export default function RootLayout({ children }) {
  // Schema JSON-LD (Zice lui Google că ăsta e un Software/VideoGame)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Ciocnim.ro",
    "description": "Joc online de ciocnit ouă pentru sărbătorile de Paște.",
    "genre": ["Casual", "Multiplayer", "Party"],
    "playMode": "MultiPlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "inLanguage": "ro-RO",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RON" }
  };

  return (
    <html lang="ro" className="bg-[#0f0000]">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${fontOutfit.className} antialiased text-white min-h-screen flex flex-col selection:bg-yellow-500 selection:text-black overflow-x-hidden`}>
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-red-950 via-[#0f0000] to-black"></div>
        <div className="flex-1 w-full h-full relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}