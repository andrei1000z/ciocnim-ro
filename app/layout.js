import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

/**
 * ====================================================================================================
 * CIOCNIM.RO - TRADIȚIA ROMÂNEASCĂ DE PAȘTE ÎN ERA DIGITALĂ (ROOT LAYOUT)
 * ====================================================================================================
 * Proiect: Platformă modernă și interactivă pentru a ciocni ouă virtuale cu prietenii și familia.
 * Tehnologii: Next.js 16 (App Router), React 19, Tailwind CSS, SEO Metadata API.
 * * * 🛠️ ACTUALIZĂRI ȘI OPTIMIZĂRI IMPLEMENTATE (V22.0 - THE NATIONAL AWAKENING):
 * 1. PERSISTENȚĂ GLOBALĂ: Acest fișier învelește întreaga aplicație în `ClientWrapper`. 
 * Acest wrapper este inima care ține minte (în LocalStorage și Context) numele jucătorului, 
 * culoarea oului, echipa din care face parte și meciurile câștigate/pierzute.
 * 2. OPTIMIZARE MOBILĂ SUPREMĂ (PWA & Safe Area): Am implementat reguli stricte de CSS direct 
 * în root pentru a preveni "scroll-ul lateral" (overflow-x) și zoom-ul automat pe iPhone-uri.
 * S-a adăugat `overscroll-behavior: none` pentru a elimina efectul enervant de elasticitate de pe browsere.
 * 3. SEO NUCLEAR: Obiectul `metadata` a fost extins la maximum. S-au adăugat structuri pentru 
 * a domina căutările Google și pentru un aspect "viral" la distribuirea pe WhatsApp, Facebook, TikTok.
 * 4. DESIGN LAYERED: Fundalul și efectele de lumină (glow) sunt separate de conținutul principal, 
 * oferind un randament stabil de 120 FPS chiar și pe telefoanele mai vechi.
 * ====================================================================================================
 */

// Configurare Font Brand: Outfit
// Un font modern, curat, extrem de lizibil pe telefoane. Includem subsetul "latin-ext" 
// pentru a ne asigura că literele cu diacritice (ă, î, â, ș, ț) se văd perfect în numele jucătorilor.
const outfit = Outfit({ 
  subsets: ["latin", "latin-ext"], 
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-outfit"
});

/**
 * ====================================================================================================
 * MOTORUL SEO (METADATA API NUCLEAR)
 * Aici definim cum ne vede Google și cum arată link-ul când este trimis pe WhatsApp/Facebook.
 * Optimizat pentru dominare în SERP (Search Engine Results Page) în perioada sărbătorilor.
 * ====================================================================================================
 */
export const metadata = {
  title: {
    default: "Ciocnim.ro - Joacă online cu ouă de Paște alături de prieteni!",
    template: "%s | Ciocnim.ro"
  },
  description: "Tradiția românească de Paște acum pe telefonul tău! Intră pe Ciocnim.ro, alege-ți oul norocos, fă un grup cu familia sau joacă online cu prietenii. Hristos a Înviat! Competiție live, fără lag.",
  applicationName: "Ciocnim.ro",
  keywords: [
    "ciocnit oua online", "paste 2026", "jocuri de paste", "ciocnim.ro", "ciocnim",
    "traditii romanesti", "joaca cu prietenii", "grup familie paste", "joc oua paste",
    "meciuri private oua", "hristos a inviat", "clasament ciocnit oua", "paste romania",
    "joc online paste", "sparge oul"
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
  alternates: {
    canonical: "/",
    languages: {
      "ro-RO": "/",
    },
  },
  // OpenGraph controlează cum arată preview-ul link-ului pe Facebook, WhatsApp, TikTok etc.
  openGraph: {
    title: "Ciocnim.ro - Te provoc la un meci de Paște! 🥚",
    description: "Am spart zeci de ouă azi! Intră și tu, fă-ți o echipă cu familia sau joacă online în Arena Globală. Hristos a Înviat!",
    url: "https://ciocnim.ro",
    siteName: "Ciocnim.ro",
    images: [
      {
        url: "/og-image-paste.jpg", // Imaginea de cover când trimiți link-ul (Asigură-te că pui una în folderul 'public')
        width: 1200,
        height: 630,
        alt: "Aplicația Ciocnim.ro - Tradiție de Paște Digitală"
      }
    ],
    locale: "ro_RO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ciocnim.ro - Tradiția de Paște",
    description: "Alege un ou, trimite codul unui prieten și vezi cine câștigă în Arena Neurală!",
    images: ["/og-image-paste.jpg"],
  },
  // Setări pentru instalarea aplicației direct pe ecranul principal al telefonului (PWA)
  appleWebApp: {
    capable: true,
    title: "Ciocnim.ro",
    statusBarStyle: "black-translucent",
    startupImage: ["/apple-touch-icon.png"],
  },
  // Instrucțiuni stricte pentru Google Bot ca să ne indexeze rapid
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

/**
 * ====================================================================================================
 * CONFIGURARE VIEWPORT (BLINDARE PENTRU TELEFOANE)
 * Previne zoom-ul nedorit pe mobil, oferind o senzație de "aplicație nativă", nu de simplu site.
 * ====================================================================================================
 */
export const viewport = {
  themeColor: "#020202",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

/**
 * ====================================================================================================
 * COMPONENTA PRINCIPALĂ (ROOT LAYOUT)
 * Aici se construiește scheletul HTML al întregului site.
 * ====================================================================================================
 */
export default function RootLayout({ children }) {
  return (
    <html lang="ro" className={`${outfit.variable} selection:bg-red-600/30 scroll-smooth`}>
      <head>
        {/* Meta Tag-uri suplimentare pentru compatibilitate maximă cu iOS/Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      
      <body className={`
        ${outfit.className} 
        bg-[#020202] /* Baza extrem de întunecată pentru a scoate în evidență elementele UI */
        text-white 
        min-h-[100dvh] 
        w-full 
        max-w-[100vw] 
        overflow-x-hidden 
        antialiased 
        touch-none 
        selection:text-white
        scrollbar-hide
      `}>
        
        {/* ============================================================================ */}
        {/* STRATURI DE FUNDAL ȘI LUMINI (AMBIENT GLOW - TECH PRIMITIVE) */}
        {/* ============================================================================ */}
        <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
          {/* Straturi subtile de culoare pentru profunzime pe ecrane mari */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_15%_50%,rgba(220,38,38,0.03),transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_85%_30%,rgba(234,179,8,0.02),transparent_50%)]"></div>
          
          {/* Watermark-uri uriașe, aproape invizibile, care fixează tradiția în fundal */}
          <div className="absolute top-[15%] right-[-10%] text-[20vh] md:text-[28vh] font-black italic text-white/[0.01] uppercase select-none rotate-12 pointer-events-none tracking-tighter mix-blend-overlay">TRADIȚIE</div>
          <div className="absolute bottom-[15%] left-[-10%] text-[20vh] md:text-[28vh] font-black italic text-white/[0.01] uppercase select-none -rotate-12 pointer-events-none tracking-tighter mix-blend-overlay">PAȘTE</div>
        </div>

        {/* ============================================================================ */}
        {/* CLIENT WRAPPER - GESTIONEAZĂ MEMORIA (ECHIPA, SCOR, NUME) */}
        {/* ============================================================================ */}
        <ClientWrapper>
          <div className="relative z-10 w-full max-w-[100vw] overflow-x-hidden min-h-[100dvh] flex flex-col">
            
            {/* CONTAINERUL PRINCIPAL PENTRU PAGINI */}
            {/* px-mobile-fix protejează site-ul de "bretonul" telefoanelor noi (Dynamic Island / Notch) */}
            <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden px-mobile-fix relative">
              {children}
            </main>

            {/* ============================================================================ */}
            {/* FOOTER GLOBAL - ASCUNS SUBTIL JOS PENTRU SEO (Nu deranjează UI-ul vizual) */}
            {/* ============================================================================ */}
            <footer className="w-full py-8 text-center pointer-events-none opacity-[0.15] mt-auto select-none" aria-hidden="true">
               <div className="flex flex-col items-center gap-3">
                 <div className="h-px w-40 bg-gradient-to-r from-transparent via-white/30 to-transparent mb-1" />
                 <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.6em]">
                    CIOCNIM.RO • SĂRBĂTORI FERICITE 2026
                 </p>
                 <div className="flex gap-4 md:gap-6 mt-1">
                    <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/50">Joc Online</span>
                    <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/50">Grupuri Private</span>
                    <span className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-white/50">Clasament Live</span>
                 </div>
               </div>
            </footer>

          </div>
        </ClientWrapper>

        {/* ============================================================================ */}
        {/* FIX-URI CSS GLOBALE INJECTATE DIRECT (MOTORUL ANTI-CROP ȘI ANTI-ZOOM) */}
        {/* ============================================================================ */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* SETĂRI PENTRU SAFE AREA (Prevenirea tăierii marginilor pe iPhone/Android) */
          :root {
            --safe-area-left: env(safe-area-inset-left, 0px);
            --safe-area-right: env(safe-area-inset-right, 0px);
            --safe-area-top: env(safe-area-inset-top, 0px);
            --safe-area-bottom: env(safe-area-inset-bottom, 0px);
          }

          /* FUNDAMENTUL PAGINII: Previne scroll-ul lateral și efectul de bounce pe iOS */
          html, body {
            min-height: 100dvh;
            width: 100vw;
            max-width: 100%;
            position: relative;
            background-color: #020202;
            overscroll-behavior-y: none; /* ELIMINĂ "PULL-TO-REFRESH" - FĂCÂNDU-L SĂ SE SIMTĂ CA O APLICAȚIE NATIVĂ */
            overscroll-behavior-x: none;
          }

          /* CLASA DE PROTECȚIE A MARGINILOR */
          .px-mobile-fix {
            padding-left: var(--safe-area-left) !important;
            padding-right: var(--safe-area-right) !important;
            padding-top: var(--safe-area-top);
            padding-bottom: var(--safe-area-bottom);
          }

          /* ANTI-DOUBLE-TAP-ZOOM: Când apasă rapid să spargă oul, ecranul nu trebuie să facă zoom */
          button, input, a, [role="button"] {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent; /* Scoate flash-ul urât albastru de pe Android */
            -webkit-user-drag: none;
          }

          /* ANTI-AUTO-ZOOM PE iOS: Dacă fontul din input e mai mic de 16px, iPhone face zoom automat. Forțăm 16px. */
          @media screen and (max-width: 850px) {
            input, textarea, select {
              font-size: 16px !important;
            }
          }

          /* ANIMAȚIA GENERALĂ DE ÎNCĂRCARE A PAGINII (Modernă, lentă, curată) */
          main {
            animation: page-fade-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }

          @keyframes page-fade-in {
            0% { opacity: 0; transform: translateY(15px); filter: blur(5px); }
            100% { opacity: 1; transform: translateY(0); filter: blur(0); }
          }

          /* ASCUNDE SCROLLBAR-UL CLASIC URÂT, LĂSÂND DOAR FUNCȚIONALITATEA DE SCROLL */
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          
          /* SCROLLBAR CUSTOM PENTRU LISTELE DE MEMBRI (Titans) */
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(220, 38, 38, 0.5);
          }

          /* OPTIMIZĂRI DE FLUIDITATE PENTRU ECRANE 120HZ */
          @media (prefers-reduced-motion: no-preference) {
            * {
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            }
          }
        `}} />

      </body>
    </html>
  );
}