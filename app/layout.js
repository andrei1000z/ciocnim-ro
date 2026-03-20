import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import Script from "next/script";
import ScrollToTop from "./components/ScrollToTop";
import ThemeToggle from "./components/ThemeToggle";


const outfit = Outfit({ 
  subsets: ["latin", "latin-ext"], 
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-outfit"
});

export const metadata = {
  title: {
    default: "Ciocnim.ro – Ciocnește Ouă Online de Paște",
    template: "%s | Ciocnim.ro"
  },
  description: "Jocul tradițional de Paște, acum online! Ciocnește ouă cu familia, personalizează-ți oul și urcă în clasamentul național. Gratuit, pe orice telefon.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  applicationName: "Ciocnim.ro",
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
    description: "Jocul tradițional de Paște, acum online! Ciocnit ouă virtual, clasament național, dueluri în timp real. Gratuit, fără instalare. Hristos a Înviat!",
    url: "https://ciocnim.ro",
    siteName: "Ciocnim.ro",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Ciocnim.ro – Joc de Paște Online", type: "image/jpeg" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro – Ciocnește Ouă Online! Hristos a Înviat!",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
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
    "inLanguage": "ro"
  };

  return (
    <html lang="ro" className={`light ${outfit.variable} selection:bg-red-900/50 selection:text-amber-200 scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('c_theme');if(t==='dark')document.documentElement.classList.remove('light');else if(t==='light')document.documentElement.classList.add('light');else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.remove('light');else document.documentElement.classList.add('light')}catch(e){};if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}` }} />
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
        <a href="#main-content" className="skip-to-content">Salt la conținut</a>

        {/* Ambient glow subtil - dark mode */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(220,38,38,0.06),transparent_70%)] blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(245,158,11,0.03),transparent_70%)] blur-3xl"></div>
        </div>

        <ClientWrapper>
          <ScrollToTop />
          <ThemeToggle />
          <div className="relative z-10 w-full max-w-[100vw] min-h-[100dvh] flex flex-col">
            <main id="main-content" className="flex-1 w-full max-w-[100vw] px-mobile-fix relative">
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
            overscroll-behavior: none;
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
            animation: page-fade-in 0.3s ease-out forwards;
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