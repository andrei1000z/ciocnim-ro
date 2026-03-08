import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import Script from "next/script"; // <-- Adăugat pentru Schema Markup la final

/**
 * ====================================================================================================
 * CIOCNIM.RO - FUNDAȚIA SANCTUARULUI (V30.2 - TRADIȚIE UMANIZATĂ & ULTIMATE SEO)
 * ====================================================================================================
 * Proiect: Infrastructură globală pentru ciocnit ouă virtuale.
 * Optimizări: Viewport Repair, OLED Depth Engine, SEO Organic Max, Textură Tradițională,
 * Umanizare termeni (eliminit "Arena" / "Luptă" din MetaData).
 * ====================================================================================================
 */

const outfit = Outfit({ 
  subsets: ["latin", "latin-ext"], 
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-outfit"
});

export const metadata = {
  title: {
    default: "Ciocnim.ro - Bucuria ciocnitului de ouă, oriunde te-ai afla.",
    template: "%s | Ciocnim.ro"
  },
  description: "Îți e dor de ciocnitul de ouă cu familia? Ciocnim.ro aduce bucuria Paștelui online! Provoacă-ți prietenii sau familia la o ciocneală tradițională virtuală, oriunde te-ai afla. Hristos a Înviat!",
  applicationName: "Ciocnim.ro",
  keywords: [
    "ciocnit ouă online", "bucuria ciocnitului online", "jocul de paște 2026", "ciocnim.ro", "bătălia ouălor virtuale",
    "simulare ciocnit ouă", "satul de paște virtual", "joc browser paște", "ciocnit pe telefon fără download",
    "multiplayer ciocnit ouă", "cel mai bun joc de paște", "campioni la ciocnit ouă", "ciocnit virtual gratis",
    "gameplay tradițional românesc", "concurs de paște online", "ciocnim ouă pe mobil", "aplicație ciocnit ouă 2026",
    "tradiții românești de paște", "obiceiuri pascale 2026", "semnificația ciocnitului ouălor", "vopsit ouă natural",
    "ouă încondeiate modele", "tradiția oului roșu", "sărbători creștine tradiții", "motive populare românești",
    "ia românească și paștele", "obiceiuri din strămoși", "hristos a înviat tradiție", "povești de paște pentru copii",
    "cum se ciocnesc ouăle corect", "rețete tradiționale de paște", "vopsit ouă cu foi de ceapă", "clasament național ciocnit ouă",
    "top jucători ciocnim.ro", "bătălia regiunilor românia", "provocare duel paște", "grup privat familie ciocnit",
    "cine are cel mai tare ou", "invită prietenii la duel", "scor global ciocniri", "victorii și înfrângeri ouă", 
    "dueluri tradiționale online", "ciocnit ouă transilvania", "tradiții moldova paște", "bucuria munteniei",
    "campioni oltenia ciocnit", "jocul dobrogenilor", "bucovina tradiții vii", "banatul la masă", "maramureș ciocnit tradițional",
    "crișana paște 2026", "clasament regiuni istorice", "mândria regiunii tale", "provocări regionale online", "mesaje de paște 2026",
    "urări hristos a înviat", "felicitări virtuale paște", "cele mai frumoase mesaje de paște", "statusuri de paște facebook", "poze cu ouă roșii",
    "hristos a înviat cuvinte", "mesaje scurte de paște", "urări tradiționale românești", "spiritul paștelui online", "lumină de paște mesaj", "paște fericit tuturor",
    "joc web mobil paște", "ciocnit ouă android", "ciocnit ouă ios online", "joc fără instalare", "ciocnește oul prin mișcare",
    "vibrate on strike game", "joc tradițional modernizat", "interfață modernă paște", "grafică premium tradițională", "joc de paște securizat",
    "experiență multiplayer fluidă", "joc românesc 2026", "ou de aur ciocnim.ro", "ou de diamant", "ou cosmic de paște", "culori ouă de paște",
    "ouă personalizate online", "skin-uri tradiționale ouă", "ouă de lux virtuale", "colecție de ouă 2026",
    "ouă roșii strălucitoare", "ouă albastre safir", "ouă imperiale aurii"
  ],
  authors: [{ name: "Echipa Ciocnim.ro" }],
  creator: "Ciocnim.ro",
  publisher: "Ciocnim.ro",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ciocnim.ro"),
  openGraph: {
    title: "Ciocnim.ro - Bucuria Paștelui e online",
    description: "Îți e dor de ciocnitul de ouă cu familia? provoacă-ți familia la o ciocneală virtuală tradițională!",
    url: "https://ciocnim.ro",
    siteName: "Ciocnim.ro",
    images: [{ url: "/og-image-paste.jpg", width: 1200, height: 630, alt: "Ciocnim.ro - Paște 2026" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro - Ciocnește ouă online!",
    description: "Bucuria Paștelui, oriunde te-ai afla! Provoacă-ți familia la ciocnit.",
    images: ["/og-image-paste.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#050202", // Negru cald tradițional
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": "Ciocnim.ro",
    "url": "https://ciocnim.ro",
    "description": "Un joc tradițional de Paște online, unde utilizatorii pot ciocni ouă virtuale cu prietenii și familia, personaliza ouă și participa în clasamentul național.",
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 2
    },
    "genre": ["Joc de Tradiție", "Multiplayer Online"],
    "gamePlatform": ["Web Browser", "Mobil"],
    "author": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    }
  };

  return (
    <html lang="ro" className={`${outfit.variable} selection:bg-red-900/50 selection:text-amber-200 scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name=" apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <Script
          id="schema-main"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      
      <body className={`
        ${outfit.className} 
        bg-[#050202] 
        text-white 
        min-h-[100dvh] 
        w-full 
        max-w-[100vw] 
        overflow-x-hidden 
        antialiased 
        scrollbar-hide
        pattern-tradition
      `}>
        
        {/* OLED DEPTH ENGINE: ELEMENTE AMBIENTALE TRADIȚIONALE */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
          <div className="absolute inset-0 bg-[url('/pattern-wood.png')] opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_50%,rgba(185,28,28,0.08),transparent_60%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_30%,rgba(217,119,6,0.05),transparent_60%)]"></div>
          
          {/* Watermark-uri Subtile Tradiție */}
          <div className="absolute top-[15%] right-[-10%] text-[20vh] md:text-[28vh] font-black italic text-amber-500/[0.02] uppercase select-none rotate-12 tracking-tighter mix-blend-screen drop-shadow-sm filter sepia-[0.5]">TRADIȚIE</div>
          <div className="absolute bottom-[15%] left-[-10%] text-[20vh] md:text-[28vh] font-black italic text-amber-500/[0.02] uppercase select-none -rotate-12 tracking-tighter mix-blend-screen drop-shadow-sm filter sepia-[0.5]">PAȘTE</div>
        </div>

        <ClientWrapper>
          <div className="relative z-10 w-full max-w-[100vw] overflow-x-hidden min-h-[100dvh] flex flex-col">
            <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-mobile-fix relative">
              {children}
            </main>

            <footer className="w-full py-12 text-center pointer-events-none opacity-[0.3] mt-auto select-none relative z-10" aria-hidden="true">
               <div className="flex flex-col items-center gap-3">
                 <div className="h-px w-40 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent mb-1" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em] text-amber-500/80 drop-shadow-sm">
                    CIOCNIM.RO • PĂSTRĂM TRADIȚIA 2026
                 </p>
               </div>
            </footer>
          </div>
        </ClientWrapper>

        {/* CSS RUNTIME FIXES (THE TANK LOCK - Anti-crop sistem pentru iPhone/Android) */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --safe-area-left: env(safe-area-inset-left, 0px);
            --safe-area-right: env(safe-area-inset-right, 0px);
            --safe-area-top: env(safe-area-inset-top, 0px);
            --safe-area-bottom: env(safe-area-inset-bottom, 0px);
          }

          html, body {
            min-height: 100dvh;
            width: 100vw;
            max-width: 100%;
            position: relative;
            background-color: #050202; /* Warm OLED Black */
            overscroll-behavior-y: auto; 
            overflow-x: hidden;
          }

          .px-mobile-fix {
            padding-left: var(--safe-area-left) !important;
            padding-right: var(--safe-area-right) !important;
            padding-top: var(--safe-area-top);
            padding-bottom: var(--safe-area-bottom);
          }

          button, input, a, [role="button"] {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }

          @media screen and (max-width: 850px) {
            input, textarea, select { font-size: 16px !important; }
          }

          main {
            animation: page-fade-in 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
          }

          @keyframes page-fade-in {
            0% { opacity: 0; transform: translateY(15px); filter: blur(10px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }

          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 10px; }

          @media (prefers-reduced-motion: no-preference) {
            * { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          }
        `}} />

      </body>
    </html>
  );
}