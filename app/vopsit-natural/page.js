"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-white/[0.04] p-8 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-4 mb-6">
      <span className="text-4xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
    </div>
    <div className="space-y-4 text-gray-300 text-sm md:text-base font-medium leading-relaxed">
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
      { "@type": "HowToStep", "name": "Fierberea vopselei", "text": "Adună cojile uscate de la 10-15 cepe și fierbe-le în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute." },
      { "@type": "HowToStep", "name": "Fierberea ouălor", "text": "Strecoară lichidul obținut, lasă-l să se răcească puțin. Adaugă ouăle crude, spălate bine înainte, și fierbe-le la foc mic timp de 10-12 minute în această vopsea naturală." },
      { "@type": "HowToStep", "name": "Lustruirea (Secretul Bunicilor)", "text": "După ce scoți ouăle din vopsea și se usucă complet, unge-le ușor cu puțin ulei sau o bucățică de slănină și șterge-le cu o cârpă moale pentru a le da acel luciu festiv." }
    ]
  };

  return (
    <>
      <Script id="schema-vopsit-natural" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <main className="min-h-screen bg-[#0c0a0a] text-gray-200">

        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-[#141111] shadow-lg shadow-black/20 border-b border-red-900/20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
            <span className="font-bold text-xl md:text-2xl text-white">Ciocnim<span className="text-red-500">.ro</span></span>
          </Link>
          <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
            Înapoi acasă
          </Link>
        </div>

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">

          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Vopsitul Natural al <span className="text-red-500">Ouălor de Paște</span>
            </h1>
            <p className="text-gray-400 font-bold text-sm md:text-base">
              Culori vibrante folosind doar ingrediente din natură, ca pe vremea bunicilor.
            </p>
          </header>

          <section className="space-y-6">

            <ArticleSection title="Roșu Tradițional (Coji de Ceapă)" icon="🧅" delay={0.05}>
              <p>Cea mai veche și mai cunoscută metodă românească. Rezultatul este un roșu-cărămiziu intens, mat și extrem de rezistent, iar coaja oului devine adesea mai tare, perfectă pentru ciocnit!</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Adună cojile uscate de la 10–15 cepe (ceapa roșie dă o nuanță mai închisă, ceapa galbenă dă un roșu-auriu).</li>
                <li>Fierbe cojile în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute.</li>
                <li>Strecoară lichidul, lasă-l să se răcească puțin, adaugă ouăle crude și fierbe-le la foc mic 10–12 minute.</li>
                <li><strong className="text-red-800">Secretul:</strong> Leagă ouăle în dresuri subțiri cu o frunză de pătrunjel pe coajă pentru modele tradiționale!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Galben Strălucitor (Curcuma)" icon="☀️" delay={0.1}>
              <p>Pentru lumina soarelui pe masa de Paște, turmericul (curcuma) oferă cel mai curat și vibrant galben.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Pune 3–4 linguri pline de pudră de turmeric în 3 căni de apă fierbinte.</li>
                <li>Adaugă 2 linguri de oțet (fixatorul culorii).</li>
                <li>Lasă ouăle fierte în amestec cel puțin 2–3 ore. Pentru galben neon, lasă-le peste noapte la frigider!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Albastru Ceresc (Varză Roșie)" icon="🥬" delay={0.15}>
              <p>Varza roșie nu colorează ouăle în roșu, ci într-un albastru absolut superb, asemănător cerului senin de primăvară.</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Taie o jumătate de varză roșie în bucăți mari și fierbe-o în 4 căni de apă timp de 45 de minute.</li>
                <li>Scoate varza și adaugă 2–3 linguri de oțet în lichidul rămas.</li>
                <li>Scufundă ouăle fierte (ideal cu coajă albă) și lasă-le câteva ore. Cu cât stau mai mult, cu atât albastrul va fi mai profund.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Secretul Luciului (Atingerea Finală)" icon="✨" delay={0.2}>
              <p>Vopselele naturale tind să lase ouăle cu un aspect mat. Bunicile aveau un secret simplu pentru a le face să strălucească.</p>
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-500 rounded-xl">
                <p className="text-yellow-800 font-bold italic text-center text-sm md:text-base">
                  Imediat ce scoți ouăle din vopsea și se usucă, unge-le ușor cu o bucățică de slănină sau cu puțin ulei de floarea soarelui. Lustruiește-le cu o cârpă moale!
                </p>
              </div>
            </ArticleSection>

          </section>

          <div className="text-center">
            <Link href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-lg font-black text-lg border-4 border-red-900 hover:bg-red-800 transition-all active:scale-95 shadow-lg">
              🥚 Ciocnește ouă online
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
