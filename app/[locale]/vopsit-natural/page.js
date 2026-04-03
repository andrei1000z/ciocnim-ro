"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";
import ContentNav from "../../components/ContentNav";

// ─── Focus Mode Toggle ─────────────────────────────────────────────────────
const FocusModeToggle = ({ active, onToggle, dyeing }) => (
  <button
    onClick={onToggle}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
      active
        ? "bg-amber-900/30 text-amber-400 border-amber-700/40 shadow-lg shadow-amber-900/20"
        : "bg-elevated text-dim border-edge-strong hover:bg-elevated-hover hover:text-body"
    }`}
  >
    {active ? "👨‍🍳" : "👁️"} {dyeing.focusModeLabel} {active ? dyeing.focusModeOn : dyeing.focusModeOff}
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
        ? "bg-surface-hover border-amber-700/30"
        : "bg-card border-edge"
    }`}
  >
    <div className="flex items-center gap-4 mb-6">
      <span className={focusMode ? "text-5xl" : "text-4xl"}>{icon}</span>
      <h2 className={`font-black text-heading ${focusMode ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}>{title}</h2>
    </div>
    <div className={`space-y-4 font-medium leading-relaxed transition-all duration-300 ${
      focusMode
        ? "text-heading text-lg md:text-xl"
        : "text-body text-sm md:text-base"
    }`}>
      {children}
    </div>
  </motion.article>
);

export default function VopsitNaturalPage() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const dyeing = t('content.dyeing');

  const [focusMode, setFocusMode] = useState(false);

  // Generate HowTo schema dynamically from sections
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": dyeing.pageTitle ? `${dyeing.pageTitle} ${dyeing.pageHighlight || ''}`.trim() : "Natural egg dyeing",
    "description": dyeing.pageSubtitle || "",
    "totalTime": "PT1H",
    "step": dyeing.sections
      ? dyeing.sections
          .filter(s => s.steps || s.tips)
          .map((section, idx) => ({
            "@type": "HowToStep",
            "name": section.title,
            "text": (section.steps || section.tips || section.paragraphs || []).join('. '),
            "position": idx + 1
          }))
      : []
  };

  return (
    <>
      <Script id="schema-vopsit-natural" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      <main className={`min-h-screen text-body transition-colors duration-300 bg-main`}>

        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-elevated shadow-lg shadow-black/20 border-b border-red-900/20">
          <LocaleLink href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
            <span className="font-bold text-xl md:text-2xl text-heading">Trosc<span className="text-accent-red-strong">.gg</span></span>
          </LocaleLink>
          <div className="flex items-center gap-3">
            <FocusModeToggle active={focusMode} onToggle={() => setFocusMode(f => !f)} dyeing={dyeing} />
            <LocaleLink href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 hidden md:inline-block">
              {dyeing.backHome || "Home"}
            </LocaleLink>
          </div>
        </div>
        <ContentNav current="/vopsit-natural" />

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
                👨‍🍳 {dyeing.focusModeBanner || `${dyeing.focusModeLabel} ${dyeing.focusModeOn}`}
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
              {dyeing.pageTitle} <span className="text-red-500">{dyeing.pageHighlight}</span>
            </h1>
            <p className={`text-dim font-bold ${focusMode ? "text-base md:text-lg" : "text-sm md:text-base"}`}>
              {dyeing.pageSubtitle}
            </p>
          </header>

          <section className="space-y-6">
            {dyeing.sections && dyeing.sections.map((section, i) => (
              <ArticleSection key={i} title={section.title} icon={section.icon} delay={i * 0.05} focusMode={focusMode}>
                {section.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
                {section.steps && (
                  <ol className="list-decimal pl-6 space-y-3 mt-4">
                    {section.steps.map((step, j) => <li key={j}>{step}</li>)}
                  </ol>
                )}
                {section.tips && (
                  <ul className={`list-disc pl-6 space-y-3 mt-4 ${focusMode ? "marker:text-red-400" : ""}`}>
                    {section.tips.map((tip, j) => <li key={j} dangerouslySetInnerHTML={{ __html: tip }} />)}
                  </ul>
                )}
                {section.highlight && (
                  <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
                    focusMode
                      ? "bg-amber-900/20 border-amber-700/40"
                      : "bg-amber-900/10 border-amber-700/20"
                  }`}>
                    <p className={`font-bold italic text-center ${
                      focusMode ? "text-amber-300 text-lg md:text-xl" : "text-amber-400 text-sm md:text-base"
                    }`}>
                      {section.highlight}
                    </p>
                  </div>
                )}
              </ArticleSection>
            ))}
          </section>

          <div className="text-center">
            <LocaleLink href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
              {dyeing.ctaOnline || "🥚 Play online"}
            </LocaleLink>
          </div>

        </div>
      </main>
    </>
  );
}
