import { Outfit } from "next/font/google";
import "./globals.css";
import ClientWrapper from "./components/ClientWrapper";

/**
 * ==========================================================================================
 * CIOCNIM.RO - ARHITECTURĂ ROOT LAYOUT SUPREMĂ (VERSION 7.0 - TITAN APP EDITION)
 * ------------------------------------------------------------------------------------------
 * Această componentă este "Sistemul de Operare" al arenei noastre.
 * 📜 LOGICĂ IMPLEMENTATĂ ÎN V7.0:
 * 1. APP PERSISTENCE: Configurări pentru manifest și PWA (site-ul ține minte tot).
 * 2. SEO CUANTIC: Optimizare agresivă pentru cuvinte cheie de Paște și Gaming.
 * 3. SCHEMA ENGINE: JSON-LD pentru Jocuri, FAQ și Organizație.
 * 4. VISUAL LAYERING: 5 straturi de fundal pentru profunzime 3D (Parallax).
 * 5. VIEWPORT CONTROL: Blocare totală a zoom-ului pentru gesturi de impact (Vibrator/Acc).
 * ==========================================================================================
 */

const fontOutfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap', 
  variable: '--font-outfit',
});

/**
 * METADATA ENGINE (TITAN SEO V7.0)
 * Structură optimizată pentru indexare Google instantanee și preview-uri WhatsApp virale.
 */
export const metadata = {
  title: {
    default: "Ciocnim.ro 🥚 | Arena Națională de Ciocnit Ouă Online 2026",
    template: "%s | Ciocnim.ro - Tradiția Digitală"
  },
  
  description: "Cea mai tare aplicație de Paște! Ciocnește ouă în timp real cu 0.1% șansă la Oul de Aur. Chat la Random, Echipe și Victorii cu Steluțe. Hristos a Înviat!",
  
  keywords: [
    "ciocnim oua", "joc paste 2026", "oua rosii digitale", "Ciocnim.ro", 
    "ou de aur", "joc multiplayer paste", "hristos a inviat", 
    "duel oua online", "matchmaking oua", "clasament national oua", 
    "traditii romanesti online", "joc familie paste", "aplicatie ciocnit oua"
  ],
  
  applicationName: 'Ciocnim.ro',
  authors: [{ name: "Andrei & Gemini AI", url: "https://ciocnim.ro" }],
  generator: 'Next.js 15 Titan',
  referrer: 'origin-when-cross-origin',
  
  // PROTOCOL OPENGRAPH (Viralizare WhatsApp/Facebook/Instagram)
  openGraph: {
    title: "Ciocnim.ro 🥚 | Te provoc! Oul tău e destul de tare?",
    description: "Am intrat în Arena Ciocnim.ro! Avem Ouă de Aur, Chat la Random și Echipe de Familie. Intri?",
    url: 'https://ciocnim.ro',
    siteName: 'Ciocnim.ro - Titan App',
    locale: 'ro_RO',
    type: 'website',
    images: [{ url: '/og-image-v7.jpg', width: 1200, height: 630, alt: 'Arena Ciocnim.ro V7' }],
  },

  // CONFIGURARE TWITTER / X
  twitter: {
    card: 'summary_large_image',
    title: 'Ciocnim.ro 🥚 | Tradiția românească devine Sport Electronic',
    description: 'Bătălii în timp real, Ouă de Aur și Chat Global.',
    images: ['/og-image-v7.jpg'],
  },

  // CONFIGURARE PWA (SITE-UL CA O APLICAȚIE)
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: "Ciocnim.ro",
    statusBarStyle: "black-translucent",
  },

  // ICONS
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

/**
 * VIEWPORT MASTER CONFIG
 * Asigură că aplicația nu se mișcă haotic pe ecranele tactile în timpul jocului.
 */
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#050000',
};

/**
 * ROOT LAYOUT COMPONENT
 */
export default function RootLayout({ children }) {
  
  /**
   * JSON-LD STRUCTURED DATA (MULTI-SCHEMA)
   * Combinăm schema de Joc cu cea de FAQ și Brand pentru autoritate maximă în Google.
   */
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Ciocnim.ro",
      "operatingSystem": "Web, iOS, Android",
      "applicationCategory": "GameApplication",
      "genre": "Casual Multiplayer",
      "description": "Prima arenă digitală de ciocnit ouă cu sistem de Golden Egg și chat live.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "RON" }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [{
        "@type": "Question",
        "name": "Ce este Oul de Aur pe Ciocnim.ro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Oul de Aur este un drop rar (0.1% șansă sau drop orar) care îți garantează victoria automată în orice duel."
        }
      }]
    }
  ];

  return (
    <html lang="ro" className="scroll-smooth">
      <head>
        {/* Injecție Date Structurate */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      
      <body className={`
        ${fontOutfit.variable} 
        ${fontOutfit.className} 
        bg-[#050000] 
        text-white 
        antialiased 
        selection:bg-red-600 
        min-h-screen 
        relative 
        overflow-x-hidden
      `}>
        
        {/* --- MULTI-LAYERED BACKGROUND ENGINE (MODERN V7) --- */}
        
        {/* Stratul 1: Ethnic Texture Pattern */}
        <div className="fixed inset-0 z-[-5] opacity-[0.05] pointer-events-none bg-ethnic-dark"></div>
        
        {/* Stratul 2: Deep Gradient Vignette */}
        <div className="fixed inset-0 z-[-4] bg-gradient-to-b from-[#1a0000] via-transparent to-[#050000] pointer-events-none"></div>
        
        {/* Stratul 3: Ambient Glow Red (Top Left) */}
        <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-red-600/10 blur-[150px] rounded-full pointer-events-none z-[-3] animate-pulse"></div>
        
        {/* Stratul 4: Ambient Glow Gold (Bottom Right) */}
        <div className="fixed bottom-[-10%] right-[-20%] w-[60%] h-[60%] bg-yellow-600/5 blur-[120px] rounded-full pointer-events-none z-[-2]"></div>

        {/* Stratul 5: Moving Particles (CSS Only) */}
        <div className="fixed inset-0 z-[-1] opacity-[0.1] pointer-events-none">
           <div className="absolute top-[10%] left-[20%] w-1 h-1 bg-white rounded-full animate-float"></div>
           <div className="absolute top-[60%] left-[80%] w-2 h-2 bg-red-600 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        {/* CLIENT WRAPPER: Administrează Persistența, Pusher și Audio */}
        <ClientWrapper>
          <div className="flex flex-col min-h-screen relative z-10">
            
            {/* MAIN VIEWPORT */}
            <main className="flex-grow w-full relative outline-none" role="main">
              {children}
            </main>

            {/* SEO TITAN FOOTER (Extins cu link-uri de tradiție și social) */}
            <footer className="w-full py-20 px-8 mt-auto border-t border-white/5 bg-black/80 backdrop-blur-2xl">
              <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Brand & Mission */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🥚</span>
                    <span className="font-black uppercase tracking-tighter text-xl italic">Ciocnim<span className="text-red-600">.ro</span></span>
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Transformăm tradiția milenară de Paște într-o experiență digitală de elită. 
                    Matchmaking cu 0.1% șansă la Oul de Aur și steluțe de veterani.
                  </p>
                </div>

                {/* Navigation & Tradition */}
                <div className="flex flex-col gap-4">
                  <h4 className="text-[11px] font-black text-red-600 uppercase tracking-widest">Resurse Luptători</h4>
                  <ul className="space-y-2">
                    {['Codul de Onoare', 'Tradiția Ouălor', 'Echipe Celebre', 'Suport Tehnic'].map(item => (
                      <li key={item} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social & Holiday Greeting */}
                <div className="space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-2">Status Server 2026</p>
                    <div className="flex items-center gap-2">
                      <div className="presence-dot"></div>
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Sincronizat cu Arena Națională</span>
                    </div>
                  </div>
                  <div className="text-right md:text-left">
                    <p className="text-[10px] text-white/10 uppercase tracking-[0.4em] font-black mb-1">
                      Ciocnim.ro &copy; 2026 • Update 7.0 Titan
                    </p>
                    <p className="text-[9px] text-red-600/40 font-black uppercase tracking-[0.2em] italic">
                      Hristos a Înviat! Paște Fericit alături de familie!
                    </p>
                  </div>
                </div>

              </div>
            </footer>

          </div>
        </ClientWrapper>

        {/* Global Portals */}
        <div id="modal-root"></div>
        <div id="toast-root"></div>

        {/* No-JS Support */}
        <noscript>
          <div className="fixed inset-0 bg-black z-[2000] flex items-center justify-center text-center p-12">
            <h2 className="text-white font-black uppercase tracking-widest">
              Fără JavaScript nu există Ciocnire! <br/>
              Activează JS pentru a intra în Arena 2026.
            </h2>
          </div>
        </noscript>
      </body>
    </html>
  );
}

/**
 * ==========================================================================================
 * SUMAR TEHNIC LAYOUT V7.0:
 * 1. PWA Readiness: Manifest și meta-tag-uri pentru experiență de "App".
 * 2. Stratificare: 5 layere vizuale pentru design modern și profunzime.
 * 3. Schema Markup: JSON-LD extins (App + FAQ) pentru SEO de top.
 * 4. UX: Viewport blocat la 1:1 pentru gesturi de impact brusc.
 * 5. Branding: Ierarhie vizuală nouă în footer și watermark-uri de fundal.
 * ==========================================================================================
 */