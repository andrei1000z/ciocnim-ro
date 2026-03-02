"use client";

/**
 * ========================================================================================================================
 * CIOCNIM.RO - THE SEO TITAN CODEX (VERSION 22.5 - TRADIȚIA DIGITALIZATĂ)
 * ------------------------------------------------------------------------------------------------------------------------
 * Autori: Gemini AI & Andrei (The Master Architects of 2026)
 * Rol: Landing page secundar pentru indexare semantică masivă (SEO).
 * * 📜 LOGICĂ ȘI FILOZOFIE V22.5:
 * 1. ORGANIC TRAFFIC MAGNET: Structură H1-H2-H3 optimizată pentru a capta căutările de Paște.
 * 2. SCROLL REVEAL ENGINE: Framer Motion animează articolele pe măsură ce utilizatorul dă scroll, 
 * scăzând bounce rate-ul și crescând "Time on Site" (metrică vitală pentru Google).
 * 3. NATIVE INTEGRATION: Link-uri interne strategice către Arena Globală pentru a converti cititorii în jucători.
 * ========================================================================================================================
 */

import { motion } from "framer-motion";
import Link from "next/link";
import { Suspense } from "react";

// ==========================================================================================
// 1. ENGINE GRAFIC: SCROLL ANIMATIONS
// ==========================================================================================

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article 
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } }
    }}
    className="liquid-glass p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-red-600/10 shadow-2xl relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] group-hover:bg-red-600/10 transition-colors duration-700 pointer-events-none" />
    
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">{icon}</span>
      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">{title}</h2>
    </div>
    
    <div className="space-y-4 text-[13px] md:text-[15px] font-bold text-white/60 leading-relaxed relative z-10 tracking-wide">
      {children}
    </div>
  </motion.article>
);

// ==========================================================================================
// 2. ROOT EXPORT: Pagina de Tradiții
// ==========================================================================================

export default function TraditiiPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#010000] selection:bg-red-600/50">
      
      {/* NAVBAR SIMPLIFICAT (INLINE) */}
      <nav className="fixed top-4 md:top-8 left-0 w-full flex justify-center z-[9999] px-4 md:px-6 pointer-events-none">
        <div className="liquid-glass p-3 md:p-4 rounded-full flex items-center justify-between bg-black/98 border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl pointer-events-auto min-w-[300px] md:min-w-[400px]">
          <Link href="/" className="flex items-center gap-4 pl-4 md:pl-6 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🥚</span>
            <span className="font-black text-lg md:text-xl uppercase tracking-tighter text-white">Ciocnim<span className="text-red-600">.ro</span></span>
          </Link>
          <Link href="/" className="px-6 py-2 bg-red-600 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-500 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]">
            Înapoi în Arenă
          </Link>
        </div>
      </nav>

      {/* STRATURILE DE FUNDAL AMBIENTALE */}
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
         <div className="ambient-glow-red opacity-40 mix-blend-screen scale-150 translate-x-1/4" />
         <div className="ambient-glow-gold opacity-20 mix-blend-overlay scale-150 -translate-x-1/4" />
         <div className="fixed inset-0 bg-liquid-mesh opacity-[0.03]" />
      </div>

      <div className="w-full max-w-[1000px] mx-auto pt-40 md:pt-48 pb-32 px-4 md:px-8 relative z-10 flex flex-col gap-12 md:gap-16">
        
        {/* HERO SECTION */}
        <motion.header 
          initial="hidden" animate="visible" variants={fadeUpVariant}
          className="text-center space-y-6 md:space-y-8"
        >
          <div className="inline-block px-6 py-2 rounded-full bg-red-600/10 border border-red-600/20 mb-2">
             <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.8em] text-red-500 animate-pulse">Codexul Național</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,1)]">
            TRADIȚIA <br className="md:hidden" /><span className="text-red-600">CIOCNITULUI</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/40 text-[11px] md:text-[14px] font-black uppercase tracking-[0.4em] leading-relaxed italic">
            De la ouăle roșii vopsite în Joia Mare, până la Arena Digitală din 2026. Află regulile jocului de Paște care a unit generații.
          </p>
        </motion.header>
        
        {/* ARTICOLELE (SEO MEAT) */}
        <section className="flex flex-col gap-8 md:gap-12 w-full mt-10">
          
          <ArticleSection title="De ce ciocnim ouă de Paște?" icon="🩸" delay={0.1}>
            <p>
              Tradiția ciocnitului ouălor de Paște este una dintre cele mai vechi și respectate datini din România. Legenda spune că Sfânta Maria Magdalena, ajungând la Roma, i-ar fi oferit împăratului Tiberiu un ou roșu, rostind cuvintele <strong>"Hristos a Înviat!"</strong>.
            </p>
            <p>
              Culoarea roșie simbolizează sângele vărsat de Mântuitor pentru iertarea păcatelor, iar ciocnitul oului reprezintă deschiderea Sfântului Mormânt și învierea Sa.  Astăzi, acest <em>joc de Paște</em> a depășit granițele fizice, devenind un prilej de bucurie și competiție prietenoasă, fie la masa în familie, fie online pe platforme precum Ciocnim.ro.
            </p>
          </ArticleSection>

          <ArticleSection title="Regulile Nescrise: Cap la Dos" icon="📜" delay={0.2}>
            <p>
              Dacă te-ai întrebat vreodată <strong>cum se ciocnesc ouăle de Paște</strong> corect, există un protocol strict transmis din moși-strămoși. În prima zi de Paște, se ciocnește doar "cap la cap" (partea mai ascuțită a oului).
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4 text-white/70">
              <li><strong>Cap la Cap:</strong> Regula de aur a primei zile de sărbătoare.</li>
              <li><strong>Cap la Dos:</strong> Permis începând cu a doua zi de Paște (luni).</li>
              <li><strong>Dos la Dos:</strong> Rezervat pentru a treia zi de sărbătoare.</li>
            </ul>
            <p className="mt-4">
               Cel care lovește primul (Atacantul) rostește "Hristos a Înviat!", iar cel care se apără (ține oul fix) răspunde cu "Adevărat a Înviat!". În Arena noastră digitală, sistemul preia acest rol, tu trebuie doar să faci mișcarea perfectă din încheietură!
            </p>
          </ArticleSection>

          <ArticleSection title="Războiul Regiunilor: Moldova vs. Ardeal" icon="⚔️" delay={0.3}>
            <p>
              În Bucovina și Moldova, încondeierea ouălor a fost ridicată la rang de artă, cu motive geometrice complexe (cruci, frunze de stejar). În Ardeal și Banat, tradiția a adoptat influențe locale unice, iar ciocnitul se face adesea cu ouă vopsite cu frunze de ceapă.
            </p>
            <p>
              Pe <strong>Ciocnim.ro</strong> am digitalizat această competiție istorică prin sistemul de <em>Clasament pe Regiuni</em>. Când îți creezi Identitatea Digitală, alegi tabăra (ex: Oltenia, Muntenia) și fiecare ou spart de tine contribuie la supremația regiunii tale în topul național.
            </p>
          </ArticleSection>

        </section>

        {/* BOTTOM CALL TO ACTION */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full flex justify-center mt-12"
        >
          <Link href="/" className="group relative bg-red-600 p-6 md:p-8 rounded-[2.5rem] flex flex-col items-center gap-3 overflow-hidden shadow-[0_20px_60px_rgba(220,38,38,0.4)] hover:scale-105 transition-all duration-500 active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            <span className="text-4xl group-hover:animate-bounce">🛡️</span>
            <span className="text-[14px] md:text-[16px] font-black uppercase tracking-[0.4em] text-white">Intră în Arena Digitală</span>
            <span className="text-[9px] text-white/50 font-black uppercase tracking-widest">Alege-ți skin-ul și domină!</span>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}