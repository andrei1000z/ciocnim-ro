import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

/**
 * ====================================================================================================
 * CIOCNIM.RO - FUNDAȚIA SANCTUARULUI (VERSION 23.0 - CLEAN SEO & OLED)
 * ====================================================================================================
 * Proiect: Infrastructură globală pentru ciocnit ouă virtuale.
 * Optimizări: Viewport Repair, Tank Lock V2, OLED Depth Engine, SEO Supreme.
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
    default: "Ciocnim.ro - Ciocnește ouă online de Paște 2026",
    template: "%s | Ciocnim.ro"
  },
  description: "Cea mai avansată platformă de ciocnit ouă online din România. Intră în Sanctuar, alege-ți oul norocos, formează un clan cu familia și domină clasamentul național. Hristos a Înviat!",
  applicationName: "Ciocnim.ro",
  keywords: [
    "ciocnit oua online", "paste 2026", "jocuri de paste", "ciocnim.ro", "sanctuarul ciocnirii",
    "traditii romanesti digitalizate", "oul de aur", "arena nationala ciocnim", "hristos a inviat"
  ],
  authors: [{ name: "Andrei" }, { name: "Echipa Ciocnim.ro" }],
  creator: "The Master Architects",
  publisher: "Ciocnim.ro Neural Network",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://ciocnim.ro"),
  openGraph: {
    title: "Ciocnim.ro - Ciocnește ouă online de Paște 2026",
    description: "⚔️ Dueluri epice în timp real! Ciocnește Oul de Aur, apără-ți Clanul și devino Legendă. Hristos a Înviat!",
    url: "https://ciocnim.ro",
    siteName: "Ciocnim.ro",
    images: [{ url: "/og-image-paste.jpg", width: 1200, height: 630, alt: "Arena Ciocnim.ro" }],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro - Ciocnește ouă online de Paște 2026",
    description: "Ești gata pentru marea ciocneală a neamului? Intră acum în Arena!",
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
  themeColor: "#010101", // Actualizat pentru True OLED Black
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro" className={`${outfit.variable} selection:bg-red-600/30 scroll-smooth`}>
      <head>
        <meta name="google-site-verification" content="gKW3IdyucvuHkv_DkXS0gyehLrH7M7IPUfR9OGYijHU" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      
      <body className={`
        ${outfit.className} 
        bg-[#010101] 
        text-white 
        min-h-[100dvh] 
        w-full 
        max-w-[100vw] 
        overflow-x-hidden 
        antialiased 
        selection:text-white
        scrollbar-hide
      `}>
        
        {/* OLED DEPTH ENGINE: ELEMENTE AMBIENTALE */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_50%,rgba(220,38,38,0.05),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_30%,rgba(234,179,8,0.03),transparent_50%)]"></div>
          
          {/* Watermark-uri SEO Decorativ */}
          <div className="absolute top-[15%] right-[-10%] text-[20vh] md:text-[28vh] font-black italic text-white/[0.01] uppercase select-none rotate-12 tracking-tighter mix-blend-overlay">TRADIȚIE</div>
          <div className="absolute bottom-[15%] left-[-10%] text-[20vh] md:text-[28vh] font-black italic text-white/[0.01] uppercase select-none -rotate-12 tracking-tighter mix-blend-overlay">PAȘTE</div>
        </div>

        <ClientWrapper>
          <div className="relative z-10 w-full max-w-[100vw] overflow-x-hidden min-h-[100dvh] flex flex-col">
            <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-mobile-fix relative">
              {children}
            </main>

            <footer className="w-full py-12 text-center pointer-events-none opacity-[0.2] mt-auto select-none" aria-hidden="true">
               <div className="flex flex-col items-center gap-3">
                 <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/30 to-transparent mb-1" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em]">
                    CIOCNIM.RO • SĂRBĂTORI FERICITE 2026
                 </p>
                 <div className="flex gap-4 md:gap-6 mt-1">
                    <span className="text-[7px] font-bold uppercase tracking-widest text-white/50">Neural Sync V23</span>
                    <span className="text-[7px] font-bold uppercase tracking-widest text-white/50">Titan Infrastructure</span>
                 </div>
               </div>
            </footer>
          </div>
        </ClientWrapper>

        {/* CSS RUNTIME FIXES (THE TANK LOCK) */}
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
            background-color: #010101; /* OLED Sync */
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
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

          @media (prefers-reduced-motion: no-preference) {
            * { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          }
        `}} />

      </body>
    </html>
  );
}