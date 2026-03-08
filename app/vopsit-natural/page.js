"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - SECRETELE VOPSITULUI NATURAL (V27.1 - PERFECT HOWTO SCHEMA)
 * ====================================================================================================
 */

import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article 
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } }
    }}
    className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group hover:border-red-500/30 transition-colors duration-500"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500">{icon}</span>
      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">{title}</h2>
    </div>
    
    <div className="space-y-4 text-[13px] md:text-[15px] font-bold text-white/70 leading-relaxed relative z-10">
      {children}
    </div>
  </motion.article>
);

export default function VopsitNaturalPage() {
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cum să vopsești ouăle de Paște natural cu foi de ceapă",
    "description": "Ghid complet și tradițional românesc pentru vopsitul ouălor de Paște folosind doar ingrediente naturale (foi de ceapă, turmeric, varză roșie).",
    "totalTime": "PT1H",
    "tool": [
      { "@type": "HowToTool", "name": "Oală de 2-3 litri" },
      { "@type": "HowToTool", "name": "Cârpiță moale pentru luciu" }
    ],
    "supply": [
      { "@type": "HowToSupply", "name": "Coji uscate de la 10-15 cepe" },
      { "@type": "HowToSupply", "name": "2 linguri de oțet alb" },
      { "@type": "HowToSupply", "name": "Ouă crude (preferabil albe)" },
      { "@type": "HowToSupply", "name": "Puțin ulei sau slănină" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Fierberea vopselei",
        "text": "Adună cojile uscate de la 10-15 cepe și fierbe-le în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute."
      },
      {
        "@type": "HowToStep",
        "name": "Fierberea ouălor",
        "text": "Strecoară lichidul obținut, lasă-l să se răcească puțin. Adaugă ouăle crude, spălate bine înainte, și fierbe-le la foc mic timp de 10-12 minute în această vopsea naturală."
      },
      {
        "@type": "HowToStep",
        "name": "Lustruirea (Secretul Bunicilor)",
        "text": "După ce scoți ouăle din vopsea și se usucă complet, unge-le ușor cu puțin ulei sau o bucățică de slănină și șterge-le cu o cârpă moale pentru a le da acel luciu festiv."
      }
    ]
  };

  return (
    <>
      <Script
        id="schema-vopsit-natural"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <title>Cum vopsești ouăle natural (Fără Chimicale) - Ghid Paște 2026 | Ciocnim.ro</title>
      <meta name="description" content="Secretul bunicilor: ouă roșii cu foi de ceapă, sfeclă sau afine. Ghid pas cu pas pentru un Paște autentic și culori vibrante din natură." />
      <meta property="og:title" content="Cum vopsești ouăle natural - Ghid Paște 2026 | Ciocnim.ro" />
      <meta property="og:description" content="Află rețeta tradițională pentru ouă roșii cu foi de ceapă și alte culori naturale." />

      <main className="relative min-h-screen w-full overflow-x-hidden bg-[#010101] text-white selection:bg-red-600/30 pattern-tradition">
        
        {/* OLED GLOWS */}
        <div className="ambient-glow-red"></div>
        <div className="ambient-glow-gold"></div>

        {/* HEADER SIMPLU PENTRU NAVIGARE */}
        <div className="w-full flex justify-between items-center p-6 md:p-8 absolute top-0 left-0 z-50">
           <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🥚</span>
              <span className="font-bold text-lg md:text-xl tracking-tight">Ciocnim<span className="text-red-600">.ro</span></span>
           </Link>
           <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all shadow-lg active:scale-95">
              Înapoi
           </Link>
        </div>

        <div className="w-full max-w-3xl mx-auto pt-32 pb-24 px-5 flex flex-col gap-12 relative z-10">
          
          <motion.header initial="hidden" animate="visible" variants={fadeUpVariant} className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none drop-shadow-lg">
              VOPSITUL <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500">NATURAL</span>
            </h1>
            <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
              Cum să obții culori vibrante folosind doar ingrediente din natură.
            </p>
          </motion.header>
          
          <section className="flex flex-col gap-8 w-full mt-6">
            
            <ArticleSection title="Roșu Tradițional (Coji de Ceapă)" icon="🧅" delay={0.1}>
              <p>Cea mai veche și mai cunoscută metodă românească de a vopsi ouăle. Rezultatul este un roșu-cărămiziu intens, mat și extrem de rezistent, iar coaja oului devine adesea mai tare, perfectă pentru ciocnit!</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Adună cojile uscate de la 10-15 cepe (ceapa roșie dă o nuanță mai închisă, ceapa galbenă dă un roșu-auriu).</li>
                <li>Fierbe cojile în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute.</li>
                <li>Strecoară lichidul, lasă-l să se răcească puțin, apoi adaugă ouăle crude și fierbe-le la foc mic timp de 10-12 minute în această vopsea.</li>
                <li><strong>Secretul:</strong> Poți lega ouăle în dresuri subțiri, punând o frunză de pătrunjel sau leuștean pe coajă, pentru a obține un model tradițional impecabil!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Galben Strălucitor (Curcuma)" icon="☀️" delay={0.2}>
              <p>Pentru a aduce lumina soarelui pe masa de Paște, condimentele sunt cele mai bune prietene. Turmericul (curcuma) oferă cel mai curat și vibrant galben.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Pune 3-4 linguri pline de pudră de turmeric în 3 căni de apă fierbinte.</li>
                <li>Adaugă 2 linguri de oțet (fixatorul culorii).</li>
                <li>Lasă ouăle deja fierte să se odihnească în acest amestec timp de cel puțin 2-3 ore. Pentru un galben neon, lasă-le peste noapte la frigider!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Albastru Ceresc (Varză Roșie)" icon="🥬" delay={0.3}>
              <p>Deși sună ciudat, varza roșie nu colorează ouăle în roșu, ci într-un albastru absolut superb, asemănător cerului senin de primăvară.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Taie o jumătate de varză roșie în bucăți mari și fierbe-o în 4 căni de apă timp de 45 de minute.</li>
                <li>Scoate varza și adaugă 2-3 linguri de oțet în lichidul rămas (vei observa cum apa își schimbă culoarea magic).</li>
                <li>Scufundă ouăle fierte (ideal ouă cu coajă albă) în lichid și lasă-le câteva ore bune. Cu cât stau mai mult, cu atât albastrul va fi mai profund.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Atingerea Finală (Luciul)" icon="✨" delay={0.4}>
              <p>Vopselele naturale tind să lase ouăle cu un aspect mat. Bunicile noastre aveau însă un secret simplu și eficient pentru a le face să strălucească precum niște bijuterii pe masa de Paște.</p>
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl shadow-inner">
                 <p className="text-yellow-400 font-black italic text-center text-sm md:text-base">
                   Imediat ce scoți ouăle din vopsea și se usucă, unge-le ușor cu o bucățică de slănină sau cu o dischetă demachiantă înmuiată în puțin ulei de floarea soarelui. Lustruiește-le cu o cârpă moale!
                 </p>
              </div>
            </ArticleSection>

          </section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full flex justify-center mt-12">
            <Link href="/" className="group relative bg-red-600 px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-white hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_rgba(220,38,38,0.4)] overflow-hidden text-center">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
                Ciocnește ouă online
              </span>
            </Link>
          </motion.div>

        </div>
      </main>
    </>
  );
}