import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";
import Script from "next/script";
import ScrollToTop from "./components/ScrollToTop";
import ThemeToggle from "./components/ThemeToggle";
import Footer from "./components/Footer";


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
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
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
  colorScheme: "dark light",
};

export default function RootLayout({ children }) {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Ciocnim.ro",
    "url": "https://ciocnim.ro",
    "description": "Un joc tradițional de Paște online, unde utilizatorii pot ciocni ouă virtuale cu prietenii și familia, personaliza ouă și participa în clasamentul național.",
    "applicationCategory": "GameApplication",
    "applicationSubCategory": "BrowserGame",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "author": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Ciocnim.ro"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON"
    },
    "inLanguage": "ro",
    "image": "/og-image.jpg"
  };

  return (
    <html lang="ro" className={`${outfit.variable} selection:bg-red-900/50 selection:text-amber-200 scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('c_theme');if(t==='dark'){;}else if(t==='light')document.documentElement.classList.add('light');else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){;}else document.documentElement.classList.add('light')}catch(e){document.documentElement.classList.add('light')};if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(function(){});}` }} />
        <Script
          id="schema-main"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      
      <body className={`
        ${outfit.className}
        bg-main
        text-body
        min-h-screen
        min-h-[100dvh]
        w-full
        max-w-[100vw]
        overflow-x-hidden
        antialiased
        scrollbar-hide
      `}>
        <a href="#main-content" className="skip-to-content">Salt la conținut</a>

        {/* Ambient glow subtil */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none opacity-60" aria-hidden="true">
          <div className="absolute top-0 left-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(220,38,38,0.06),transparent_70%)] blur-3xl will-change-transform"></div>
          <div className="absolute bottom-0 right-0 w-[60vw] h-[60vw] bg-[radial-gradient(circle,rgba(245,158,11,0.03),transparent_70%)] blur-3xl will-change-transform"></div>
        </div>

        <ClientWrapper>
          <ScrollToTop />
          <ThemeToggle />
          <div className="relative z-10 w-full max-w-[100vw] min-h-[100dvh] flex flex-col">
            <main id="main-content" className="flex-1 w-full max-w-[100vw] px-mobile-fix relative">
              {children}
            </main>
            <Footer />
          </div>
        </ClientWrapper>

        {/* Runtime CSS — only rules not covered by globals.css */}
        <style dangerouslySetInnerHTML={{ __html: `
          body {
            max-width: 100%;
            overflow-x: hidden;
          }
          main {
            animation: page-fade-in 0.3s ease-out forwards;
          }
          @keyframes page-fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}} />

      </body>
    </html>
  );
}