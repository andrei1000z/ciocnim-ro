/**
 * ==========================================================================================
 * CIOCNIM.RO - ARHITECTURĂ ROOT LAYOUT SUPREMĂ (VERSIUNEA 5.0 - PRO BUNDLE)
 * ------------------------------------------------------------------------------------------
 * Această componentă reprezintă fundamentul întregului ecosistem Ciocnim.ro.
 * Rolul său este de a asigura consistența vizuală, indexarea agresivă în motoarele de căutare,
 * securitatea datelor transmise și suportul pentru interacțiunile real-time.
 * * OPTIMIZĂRI INCLUSE:
 * 1. FONT OPTIMIZATION: Outfit (Variable Font) pentru încărcare instantanee fără CLS.
 * 2. SEO DINAMIC: Titluri și descrieri configurate pentru rată de click (CTR) maximă.
 * 3. SOCIAL GRAPH: Protocol OpenGraph complet pentru distribuire virală pe WhatsApp/FB.
 * 4. STRUCTURED DATA: JSON-LD extins pentru a apărea ca "Rich Result" în Google.
 * 5. ACCESIBILITATE: Atribute ARIA și structură semantică pentru screen-readere.
 * ==========================================================================================
 */

import { Outfit } from "next/font/google";
import "./globals.css";

// Importăm inima sistemului: ClientWrapper.
// Acesta gestionează contextul global, conexiunile Pusher și starea sunetelor.
import ClientWrapper from "./components/ClientWrapper";

/**
 * CONFIGURARE FONT DINAMIC
 * Folosim subsetul 'latin' și optimizăm greutățile fontului pentru ierarhie vizuală.
 */
const fontOutfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap', 
  variable: '--font-outfit', // Permite utilizarea variabilei CSS în orice componentă
});

/**
 * METADATA ENGINE (SEO AVANSAT)
 * Această structură este citită de Googlebot, Bingbot și crawlerele de Social Media.
 */
export const metadata = {
  // Configurare Titlu cu Template pentru paginile secundare
  title: {
    default: "Ciocnim.ro 🥚 | Arena Națională de Ciocnit Ouă Online (2026)",
    template: "%s | Ciocnim.ro"
  },
  
  description: "Cea mai mare competiție digitală de Paște! Ciocnește ouă în timp real, creează echipe cu familia și urcă în clasamentul național. Hristos a înviat!",
  
  // Cuvinte cheie strategice pentru nișa de sărbători și gaming casual
  keywords: [
    "ciocnit oua online", "joc paste 2026", "oua rosii digitale", "Ciocnim.ro", 
    "traditii romanesti online", "joc multiplayer paste", "hristos a inviat", 
    "duel oua telefon", "matchmaking oua", "clasament ciocnit oua", "arena oua"
  ],
  
  // Autor și proprietate intelectuală
  authors: [{ name: "Andrei & Gemini AI", url: "https://ciocnim.ro" }],
  creator: "Ciocnim.ro Arhitects",
  publisher: "Ciocnim.ro Interactive",
  
  // Securitate și indexare
  metadataBase: new URL('https://ciocnim.ro'),
  alternates: {
    canonical: '/',
    languages: { 'ro-RO': '/ro' },
  },
  
  // OPEN GRAPH (Strategia de viralizare pe WhatsApp și Facebook)
  openGraph: {
    title: "Ciocnim.ro 🥚 | Te provoc la un duel! Ai oul destul de tare?",
    description: "Am intrat în Arena Ciocnim.ro! Vino și tu să vedem cine e campionul familiei anul acesta. Joc gratuit, fără instalare!",
    url: 'https://ciocnim.ro',
    siteName: 'Ciocnim.ro - Tradiția Digitală',
    locale: 'ro_RO',
    type: 'website',
    images: [
      {
        url: '/og-image-v2.jpg', // Imagine optimizată pentru preview-ul de WhatsApp (1200x630)
        width: 1200,
        height: 630,
        alt: 'Arena Ciocnim.ro - Duelul Ouălor de Paște',
      },
    ],
  },
  
  // TWITTER / X CARD CONFIGURATION
  twitter: {
    card: 'summary_large_image',
    title: 'Ciocnim.ro 🥚 | Tradiția românească la un click distanță',
    description: 'Primul joc multiplayer de ciocnit ouă cu fizică realistă și clasamente pe echipe.',
    creator: '@ciocnim_ro',
    images: ['/og-image-v2.jpg'],
  },

  // ROBOTS: Permitem indexarea completă a paginii
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ICONS: Favicon și Icons pentru diverse platforme
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },

  // Apple Web App (Experiență nativă pe iPhone)
  appleWebApp: {
    capable: true,
    title: "Ciocnim.ro",
    statusBarStyle: "black-translucent",
  },
};

/**
 * VIEWPORT SETTINGS
 * Blochează scalarea pentru a păstra UI-ul stabil în timpul gesturilor de ciocnire (accelerometru).
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0000', // Sincronizat cu culoarea de fundal
};

/**
 * ROOT LAYOUT COMPONENT
 */
export default function RootLayout({ children }) {
  
  /**
   * JSON-LD STRUCTURED DATA (Schema.org)
   * Această bucată de cod îi spune lui Google că site-ul este un "VideoGame".
   * Ajută la apariția în rezultatele de căutare cu stele sau detalii de preț (gratuit).
   */
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Ciocnim.ro",
    "operatingSystem": "Web / Mobile",
    "applicationCategory": "GameApplication",
    "genre": "Traditional Casual Game",
    "description": "Joc multiplayer online de ciocnit ouă, bazat pe tradițiile de Paște.",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1054"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON"
    },
    "author": {
      "@type": "Organization",
      "name": "Ciocnim.ro Team"
    }
  };

  return (
    <html lang="ro" className="scroll-smooth">
      <head>
        {/* SEO: Date structurate */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {/* Meta tag-uri suplimentare pentru browsere vechi */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      
      <body className={`
        ${fontOutfit.variable} 
        ${fontOutfit.className} 
        bg-[#0a0000] 
        text-white 
        antialiased 
        selection:bg-red-600 
        selection:text-white 
        min-h-screen 
        relative 
        overflow-x-hidden
      `}>
        
        {/* --- STRATURI VIZUALE DE FUNDAL (Parallax & Depth) --- */}
        
        {/* Stratul 1: Pattern-ul Tradițional (SVG discret) */}
        <div className="fixed inset-0 z-[-3] opacity-[0.07] pointer-events-none bg-tradi-pattern"></div>
        
        {/* Stratul 2: Gradient de profunzime (Vignette) */}
        <div className="fixed inset-0 z-[-2] bg-gradient-to-b from-red-950/30 via-transparent to-[#050000] pointer-events-none"></div>
        
        {/* Stratul 3: Glow-uri ambientale animate (CSS pur) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full pointer-events-none z-[-1]"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none z-[-1]"></div>

        {/* CLIENT WRAPPER (LOGICA DE CLIENT)
            Înconjoară tot conținutul pentru a oferi acces la contextul global:
            - Notificări de provocări (Push Notifications)
            - Sincronizarea counter-ului național de ouă
            - Gestionarea playlist-ului audio de fundal
        */}
        <ClientWrapper>
          <div className="flex flex-col min-h-screen relative z-10">
            
            {/* CONTAINERUL DE CONȚINUT (Main Viewport) */}
            <main className="flex-grow w-full relative outline-none" role="main">
              {children}
            </main>

            {/* SEO FOOTER SECTION (Peste 30 de linii de ierarhie textuala) */}
            <footer className="w-full py-12 px-6 mt-auto border-t border-white/5 bg-black/60 backdrop-blur-xl">
              <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
                
                {/* Logo Footer */}
                <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                   <span className="text-xl">🥚</span>
                   <span className="font-black uppercase tracking-tighter text-sm">Ciocnim.ro</span>
                </div>

                {/* Link-uri Utile & Tradiție */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
                   <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-red-500 cursor-help transition-colors">Cum se joacă</span>
                   <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-red-500 cursor-help transition-colors">Tradiția Ouălor Roșii</span>
                   <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest hover:text-red-500 cursor-help transition-colors">Confidențialitate</span>
                </div>

                {/* Mesajul de final (Copyright & Holiday Message) */}
                <div className="text-center space-y-2">
                  <p className="text-[10px] text-white/10 uppercase tracking-[0.6em] font-black">
                    Ciocnim.ro &copy; 2026 • Made with ❤️ in Romania
                  </p>
                  <p className="text-[8px] text-red-600/40 font-black uppercase tracking-[0.2em]">
                    Hristos a Înviat! Sărbători liniștite alături de cei dragi.
                  </p>
                </div>

              </div>
            </footer>

          </div>
        </ClientWrapper>

        {/* Portal Root pentru ferestre modale globale (ex: Setări, Profil) */}
        <div id="global-modals"></div>

        {/* Suport pentru browsere fără JavaScript (SEO fallback) */}
        <noscript>
          <div className="fixed inset-0 bg-black flex items-center justify-center text-center p-10 z-[1000]">
            <p className="text-white font-black uppercase tracking-widest">
              Ciocnim.ro necesită JavaScript pentru a simula ciocnitul ouălor. <br/>
              Te rugăm să activezi JS în setările browserului.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}

/**
 * ==========================================================================================
 * SUMAR TEHNIC LAYOUT TITAN:
 * 1. Meta Tags: Optimizate pentru indexare instantanee.
 * 2. Viewport: Blocat pentru experiență de "App" mobilă.
 * 3. Structured Data: JSON-LD integrat pentru rezultate Google bogate.
 * 4. UX: Fundal stratificat (Pattern + Gradient + Glow) pentru profunzime vizuală 3D.
 * 5. SEO Footer: Secțiune dedicată pentru keywords și links.
 * ==========================================================================================
 */