"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

// ─── Focus Mode Toggle ─────────────────────────────────────────────────────
const FocusModeToggle = ({ active, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
      active
        ? "bg-amber-900/30 text-amber-400 border-amber-700/40 shadow-lg shadow-amber-900/20"
        : "bg-white/[0.05] text-gray-400 border-white/[0.1] hover:bg-white/[0.08] hover:text-gray-300"
    }`}
  >
    {active ? "👨‍🍳" : "👁️"} Mod Bucătărie {active ? "ON" : "OFF"}
  </button>
);

// ─── Article Section (supports focus mode) ──────────────────────────────────
const ArticleSection = ({ title, icon, children, delay = 0, focusMode }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={`p-8 rounded-2xl border shadow-lg shadow-black/20 transition-all duration-300 ${
      focusMode
        ? "bg-[#1a1515] border-amber-700/30"
        : "bg-white/[0.04] border-white/[0.06]"
    }`}
  >
    <div className="flex items-center gap-4 mb-6">
      <span className={focusMode ? "text-5xl" : "text-4xl"}>{icon}</span>
      <h2 className={`font-black text-white ${focusMode ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>{title}</h2>
    </div>
    <div className={`space-y-4 font-medium leading-relaxed transition-all duration-300 ${
      focusMode
        ? "text-gray-100 text-lg md:text-xl"
        : "text-gray-300 text-sm md:text-base"
    }`}>
      {children}
    </div>
  </motion.article>
);

export default function VopsitNaturalPage() {
  const [focusMode, setFocusMode] = useState(false);

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cum să vopsești ouăle de Paște natural cu foi de ceapă",
    "description": "Ghid complet și tradițional românesc pentru vopsitul ouălor de Paște folosind doar ingrediente naturale (foi de ceapă, turmeric, varză roșie).",
    "totalTime": "PT1H",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "RON",
      "value": "10"
    },
    "tool": [
      { "@type": "HowToTool", "name": "Oală de 2-3 litri" },
      { "@type": "HowToTool", "name": "Cârpiță moale pentru luciu" },
      { "@type": "HowToTool", "name": "Strecurătoare" }
    ],
    "supply": [
      { "@type": "HowToSupply", "name": "Coji uscate de la 10-15 cepe" },
      { "@type": "HowToSupply", "name": "2 linguri de oțet alb" },
      { "@type": "HowToSupply", "name": "Ouă crude (preferabil albe)" },
      { "@type": "HowToSupply", "name": "Puțin ulei sau slănină" },
      { "@type": "HowToSupply", "name": "3-4 linguri pudră de turmeric (curcumă)" },
      { "@type": "HowToSupply", "name": "Jumătate de varză roșie" }
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "Pregătirea vopselei din coji de ceapă",
        "text": "Adună cojile uscate de la 10-15 cepe și fierbe-le în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Fierberea ouălor în vopsea",
        "text": "Strecoară lichidul obținut, lasă-l să se răcească puțin. Adaugă ouăle crude, spălate bine înainte, și fierbe-le la foc mic timp de 10-12 minute.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Galben cu curcumă",
        "text": "Pune 3-4 linguri de pudră de turmeric în 3 căni de apă fierbinte cu 2 linguri de oțet. Lasă ouăle fierte în amestec 2-3 ore (sau peste noapte la frigider pentru galben intens).",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Albastru cu varză roșie",
        "text": "Taie o jumătate de varză roșie și fierbe-o în 4 căni de apă timp de 45 de minute. Scoate varza, adaugă 2-3 linguri de oțet, și scufundă ouăle fierte câteva ore.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Lustruirea finală",
        "text": "După ce ouăle se usucă complet, unge-le ușor cu puțin ulei sau o bucățică de slănină și șterge-le cu o cârpă moale pentru luciu festiv.",
        "position": 5
      }
    ]
  };

  return (
    <>
      <Script id="schema-vopsit-natural" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <main className={`min-h-screen text-gray-200 transition-colors duration-300 ${
        focusMode ? "bg-[#0e0c0c]" : "bg-[#0c0a0a]"
      }`}>

        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-[#141111] shadow-lg shadow-black/20 border-b border-red-900/20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
            <span className="font-bold text-xl md:text-2xl text-white">Ciocnim<span className="text-red-500">.ro</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <FocusModeToggle active={focusMode} onToggle={() => setFocusMode(f => !f)} />
            <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 hidden md:inline-block">
              Înapoi acasă
            </Link>
          </div>
        </div>

        {/* Focus Mode Banner */}
        <AnimatePresence>
          {focusMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-900/20 border-b border-amber-700/30 px-6 py-3 text-center"
            >
              <p className="text-amber-400 text-sm font-bold">
                👨‍🍳 Mod Bucătărie activ — text mare, contrast ridicat, fără distrageri
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full mx-auto pt-8 pb-16 px-6 space-y-8 transition-all duration-300 ${
          focusMode ? "max-w-3xl" : "max-w-4xl"
        }`}>

          <header className="text-center space-y-4">
            <h1 className={`font-black text-white leading-tight ${
              focusMode ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl"
            }`}>
              Vopsitul Natural al <span className="text-red-500">Ouălor de Paște</span>
            </h1>
            <p className={`text-gray-400 font-bold ${focusMode ? "text-base md:text-lg" : "text-sm md:text-base"}`}>
              Culori vibrante folosind doar ingrediente din natură, ca pe vremea bunicilor.
            </p>
          </header>

          <section className="space-y-6">

            <ArticleSection title="Roșu Tradițional (Coji de Ceapă)" icon="🧅" delay={0.05} focusMode={focusMode}>
              <p>Cea mai veche și mai cunoscută metodă românească. Rezultatul este un roșu-cărămiziu intens, mat și extrem de rezistent, iar coaja oului devine adesea mai tare, perfectă pentru ciocnit!</p>
              <ul className={`list-disc pl-6 space-y-3 mt-4 ${focusMode ? "marker:text-red-400" : ""}`}>
                <li>Adună cojile uscate de la 10–15 cepe (ceapa roșie dă o nuanță mai închisă, ceapa galbenă dă un roșu-auriu).</li>
                <li>Fierbe cojile în 2 litri de apă cu 2 linguri de oțet alb, timp de 30 de minute.</li>
                <li>Strecoară lichidul, lasă-l să se răcească puțin, adaugă ouăle crude și fierbe-le la foc mic 10–12 minute.</li>
                <li><strong className={focusMode ? "text-amber-400" : "text-red-400"}>Secretul:</strong> Leagă ouăle în dresuri subțiri cu o frunză de pătrunjel pe coajă pentru modele tradiționale!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Galben Strălucitor (Curcuma)" icon="☀️" delay={0.1} focusMode={focusMode}>
              <p>Pentru lumina soarelui pe masa de Paște, turmericul (curcuma) oferă cel mai curat și vibrant galben.</p>
              <ul className={`list-disc pl-6 space-y-3 mt-4 ${focusMode ? "marker:text-yellow-400" : ""}`}>
                <li>Pune 3–4 linguri pline de pudră de turmeric în 3 căni de apă fierbinte.</li>
                <li>Adaugă 2 linguri de oțet (fixatorul culorii).</li>
                <li>Lasă ouăle fierte în amestec cel puțin 2–3 ore. Pentru galben neon, lasă-le peste noapte la frigider!</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Albastru Ceresc (Varză Roșie)" icon="🥬" delay={0.15} focusMode={focusMode}>
              <p>Varza roșie nu colorează ouăle în roșu, ci într-un albastru absolut superb, asemănător cerului senin de primăvară.</p>
              <ul className={`list-disc pl-6 space-y-3 mt-4 ${focusMode ? "marker:text-blue-400" : ""}`}>
                <li>Taie o jumătate de varză roșie în bucăți mari și fierbe-o în 4 căni de apă timp de 45 de minute.</li>
                <li>Scoate varza și adaugă 2–3 linguri de oțet în lichidul rămas.</li>
                <li>Scufundă ouăle fierte (ideal cu coajă albă) și lasă-le câteva ore. Cu cât stau mai mult, cu atât albastrul va fi mai profund.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Secretul Luciului (Atingerea Finală)" icon="✨" delay={0.2} focusMode={focusMode}>
              <p>Vopselele naturale tind să lase ouăle cu un aspect mat. Bunicile aveau un secret simplu pentru a le face să strălucească.</p>
              <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
                focusMode
                  ? "bg-amber-900/20 border-amber-700/40"
                  : "bg-amber-900/10 border-amber-700/20"
              }`}>
                <p className={`font-bold italic text-center ${
                  focusMode ? "text-amber-300 text-lg md:text-xl" : "text-amber-400 text-sm md:text-base"
                }`}>
                  Imediat ce scoți ouăle din vopsea și se usucă, unge-le ușor cu o bucățică de slănină sau cu puțin ulei de floarea soarelui. Lustruiește-le cu o cârpă moale!
                </p>
              </div>
            </ArticleSection>

          </section>

          <div className="text-center">
            <Link href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
              🥚 Ciocnește ouă online
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
