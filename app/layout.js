import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import Script from "next/script";
import ScrollToTop from "./components/ScrollToTop";
import ThemeToggle from "./components/ThemeToggle";

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

const currentYear = new Date().getFullYear();

export const metadata = {
  title: {
    default: `Ciocnim.ro – Ciocnește Ouă Online cu Familia și Prietenii | Paște ${currentYear}`,
    template: "%s | Ciocnim.ro"
  },
  description: `Jocul tradițional de Paște, acum online! Provoacă-ți familia la ciocnit ouă virtuale, personalizează-ți oul și urcă în clasamentul național. Gratuit, fără instalare, pe orice telefon. Hristos a Înviat ${currentYear}!`,
  applicationName: "Ciocnim.ro",
  keywords: [
    "ciocnit ouă online", "bucuria ciocnitului online", `jocul de paște ${currentYear}`, "ciocnim.ro", "bătălia ouălor virtuale",
    "simulare ciocnit ouă", "satul de paște virtual", "joc browser paște", "ciocnit pe telefon fără download",
    "multiplayer ciocnit ouă", "cel mai bun joc de paște", "campioni la ciocnit ouă", "ciocnit virtual gratis",
    "gameplay tradițional românesc", "concurs de paște online", "ciocnim ouă pe mobil", `aplicație ciocnit ouă ${currentYear}`,
    "tradiții românești de paște", `obiceiuri pascale ${currentYear}`, "semnificația ciocnitului ouălor", "vopsit ouă natural",
    "ouă încondeiate modele", "tradiția oului roșu", "sărbători creștine tradiții", "motive populare românești",
    "ia românească și paștele", "obiceiuri din strămoși", "hristos a înviat tradiție", "povești de paște pentru copii",
    "cum se ciocnesc ouăle corect", "rețete tradiționale de paște", "vopsit ouă cu foi de ceapă", "clasament național ciocnit ouă",
    "top jucători ciocnim.ro", "bătălia regiunilor românia", "provocare duel paște", "grup privat familie ciocnit",
    "cine are cel mai tare ou", "invită prietenii la duel", "scor global ciocniri", "victorii și înfrângeri ouă", 
    "dueluri tradiționale online", "ciocnit ouă transilvania", "tradiții moldova paște", "bucuria munteniei",
    "campioni oltenia ciocnit", "jocul dobrogenilor", "bucovina tradiții vii", "banatul la masă", "maramureș ciocnit tradițional",
    `crișana paște ${currentYear}`, "clasament regiuni istorice", "mândria regiunii tale", "provocări regionale online", `mesaje de paște ${currentYear}`,
    "urări hristos a înviat", "felicitări virtuale paște", "cele mai frumoase mesaje de paște", "statusuri de paște facebook", "poze cu ouă roșii",
    "hristos a înviat cuvinte", "mesaje scurte de paște", "urări tradiționale românești", "spiritul paștelui online", "lumină de paște mesaj", "paște fericit tuturor",
    "joc web mobil paște", "ciocnit ouă android", "ciocnit ouă ios online", "joc fără instalare", "ciocnește oul prin mișcare",
    "vibrate on strike game", "joc tradițional modernizat", "interfață modernă paște", "grafică premium tradițională", "joc de paște securizat",
    "experiență multiplayer fluidă", `joc românesc ${currentYear}`, "ou de aur ciocnim.ro", "ou de diamant", "ou cosmic de paște", "culori ouă de paște",
    "ouă personalizate online", "skin-uri tradiționale ouă", "ouă de lux virtuale", `colecție de ouă ${currentYear}`,
    "ouă roșii strălucitoare", "ouă albastre safir", "ouă imperiale aurii",
    "skin tradițional ou roșu", "ou albastru safir online", "ou auriu imperial",
    "ou verde de codru", "motive cross-stitch tradiționale", "ie românească pe ou",
    "ciocnit ouă live online", "câți oameni joacă acum", `clasament live paște ${currentYear}`
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
    title: "Ciocnim.ro – Ciocnește Ouă Online cu Familia și Prietenii",
    description: `Jocul tradițional de Paște, acum online! Ciocnit ouă virtual, clasament național, dueluri în timp real. Gratuit, fără instalare. Hristos a Înviat ${currentYear}!`,
    url: "https://ciocnim.ro",
    siteName: "Ciocnim.ro",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Ciocnim.ro – Joc de Paște Online" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Ciocnim.ro – Ciocnește Ouă Online! Hristos a Înviat ${currentYear}`,
    description: "Provoacă-ți familia la ciocnit ouă virtual. Gratuit, pe orice telefon, fără instalare. Hristos a Înviat!",
    images: ["/og-image.jpg"],
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
  themeColor: "#0c0a0a",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
  /** @type {string} */
  viewportMetaTags: true,
};

export default function RootLayout({ children }) {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": "Ciocnim.ro",
    "url": "https://ciocnim.ro",
    "description": "Un joc tradițional de Paște online, unde utilizatorii pot ciocni ouă virtuale cu prietenii și familia, personaliza ouă și participa în clasamentul național.",
    "numberOfPlayers": {
      "@type": "QuantitativeValue",
      "minValue": 1,
      "maxValue": 2
    },
    "genre": ["Joc de Tradiție", "Multiplayer Online", "Browser Game"],
    "gamePlatform": ["Web Browser", "Mobile"],
    "author": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    },
    "applicationCategory": "Game",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1000"
    }
  };

  return (
    <html lang="ro" className={`light ${outfit.variable} selection:bg-red-900/50 selection:text-amber-200 scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name=" apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('c_theme')==='dark')document.documentElement.classList.remove('light');else document.documentElement.classList.add('light')}catch(e){}` }} />
        <Script
          id="schema-main"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      
      <body className={`
        ${outfit.className}
        bg-[#0c0a0a]
        text-gray-200
        min-h-screen
        min-h-[100dvh]
        w-full
        max-w-[100vw]
        overflow-x-hidden
        antialiased
        scrollbar-hide
      `}>

        {/* Ambient glow subtil - dark mode */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(220,38,38,0.06),transparent_70%)] blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(245,158,11,0.03),transparent_70%)] blur-3xl"></div>
        </div>

        <ClientWrapper>
          <ScrollToTop />
          <ThemeToggle />
          <div className="relative z-10 w-full max-w-[100vw] overflow-x-hidden min-h-[100dvh] flex flex-col">
            <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-mobile-fix relative">
              {children}
            </main>
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
            background-color: var(--bg-main, #0c0a0a);
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
            animation: page-fade-in 0.6s ease-out forwards;
          }

          @keyframes page-fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
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