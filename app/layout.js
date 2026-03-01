/**
 * ==========================================================================
 * CIOCNIM.RO - ROOT LAYOUT SUPREM (VERSUNEA 3.0)
 * Structură optimizată pentru SEO, Performanță și Social Sharing.
 * ==========================================================================
 */

import { Outfit } from "next/font/google";
import "./globals.css";
// Importăm ClientWrapper - Inima interactivă a site-ului (Notificări, Pusher, Stats)
import ClientWrapper from "./components/ClientWrapper";

// Configurăm fontul Outfit - modern, rotund și foarte lizibil pe mobil
const fontOutfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '600', '700', '900'],
  display: 'swap', // Previne layout shift-ul (bun pentru SEO)
});

/**
 * CONFIGURARE METADATA - SEO & SOCIAL SHARING (OPEN GRAPH)
 * Acest bloc spune motoarelor de căutare exact ce este site-ul tău.
 */
export const metadata = {
  title: {
    default: "Ciocnim.ro 🥚 | Arena Națională de Ciocnit Ouă Online",
    template: "%s | Ciocnim.ro"
  },
  description: "Tradiția de Paște s-a mutat pe telefon! Creează-ți echipa, ciocnește ouă cu prietenii și devino campion național. Hristos a înviat!",
  keywords: [
    "ciocnit oua online", "joc paste", "oua rosii", "ciocnim.ro", 
    "traditii paste", "joc multiplayer romania", "hristos a inviat"
  ],
  authors: [{ name: "Echipa Ciocnim.ro" }],
  creator: "Ciocnim.ro",
  publisher: "Ciocnim.ro",
  metadataBase: new URL('https://ciocnim.ro'), // Pune aici domeniul tău final
  
  // Cum arată link-ul pe WhatsApp / Facebook
  openGraph: {
    title: "Ciocnim.ro 🥚 | Hai la un duel de Paște!",
    description: "Te provoc la un duel! Cine are oul mai tare? Intră în arenă acum.",
    url: '/',
    siteName: 'Ciocnim.ro',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Asigură-te că ai o poză numită og-image.jpg în folderul /public
        width: 1200,
        height: 630,
        alt: 'Ciocnim.ro Arena',
      },
    ],
  },
  
  // Configurare Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'Ciocnim.ro 🥚',
    description: 'Cel mai tare joc de Paște din România.',
    images: ['/og-image.jpg'],
  },

  // Setări pentru Web App (PWA Lite)
  appleWebApp: {
    capable: true,
    title: "Ciocnim.ro",
    statusBarStyle: "black-translucent",
  },
};

/**
 * CONFIGURARE VIEWPORT
 * Necesar pentru a bloca zoom-ul și a asigura afișarea perfectă pe iPhone/Android
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0000',
};

/**
 * COMPONENTA ROOT LAYOUT
 * Acesta este „scheletul” peste care se construiește toată aplicația.
 */
export default function RootLayout({ children }) {
  
  // Date structurate JSON-LD pentru Google Search (Schema.org)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Ciocnim.ro",
    "description": "Joc multiplayer online de ciocnit ouă, bazat pe tradițiile românești de Paște.",
    "genre": ["Multiplayer", "Casual Game", "Traditional"],
    "playMode": "MultiPlayer",
    "applicationCategory": "Game",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON"
    }
  };

  return (
    <html lang="ro" className="scroll-smooth">
      <head>
        {/* Injectăm datele structurate pentru un SEO de elită */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      
      <body className={`${fontOutfit.className} bg-[#0a0000] text-white antialiased selection:bg-red-600 selection:text-white min-h-screen relative`}>
        
        {/* TEXTURA DE FUNDAL TRADIȚIONALĂ - Prezentă pe toate paginile */}
        <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none bg-tradi-pattern"></div>
        
        {/* OVERLAY DE GRADIENT PENTRU PROFUNZIME */}
        <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-red-950/20 via-transparent to-black pointer-events-none"></div>

        {/* CLIENT WRAPPER:
          Aici se află toată logica de client care trebuie să fie „trează” mereu:
          - Notificări de duel (Pusher)
          - Chat-ul global / de echipă
          - Sunete globale
          - State-ul pentru statistici live
        */}
        <ClientWrapper>
          <div className="flex flex-col min-h-screen">
            
            {/* ZONA DE CONȚINUT DINAMIC (Home, Dashboard, Arena) */}
            <main className="flex-grow w-full relative">
              {children}
            </main>

            {/* FOOTER DISCRET - Bun pentru Keywords SEO */}
            <footer className="py-8 text-center border-t border-white/5 bg-black/50 backdrop-blur-sm">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-black">
                Ciocnim.ro • Sărbători Fericite • Hristos a Înviat!
              </p>
            </footer>

          </div>
        </ClientWrapper>

        {/* Container pentru eventuale portale / modaluri globale */}
        <div id="portal-root"></div>
      </body>
    </html>
  );
}

/**
 * ==========================================================================
 * NOTE FINALE:
 * 1. Am adăugat Viewport separat (Next.js 14+ standard).
 * 2. Am adăugat JSON-LD pentru ca Google să indexeze site-ul ca JOC.
 * 3. Structura body este optimizată pentru a preveni „salturile” de design.
 * ==========================================================================
 */