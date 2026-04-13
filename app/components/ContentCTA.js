"use client";

import { motion } from "framer-motion";
import LocaleLink from "./LocaleLink";
import { useT } from "../i18n/useT";

/**
 * Sticky CTA bar pentru paginile de conținut (/retete, /urari, /traditii, /vopsit-natural, /calendar).
 * Scopul: să converteasca vizitatorii SEO care citesc conținut spre joc.
 * Apare jos de tot pe pagină (nu fixed — doar inline la sfârșit).
 */
export default function ContentCTA() {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="my-10"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-800 via-red-700 to-amber-700 p-6 md:p-8 shadow-2xl shadow-red-900/40 border-2 border-red-500/40">
        <div className="absolute -top-10 -right-10 text-[10rem] opacity-10 select-none pointer-events-none">🥚</div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center space-y-4">
          <div className="inline-block text-4xl mb-2">🥚</div>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {t('content.cta.title') || 'Haide la ciocnit online!'}
          </h2>
          <p className="text-sm md:text-base text-white/90 max-w-md mx-auto">
            {t('content.cta.description') || 'Joacă gratuit cu prietenii și familia. Fără cont, fără reclame, direct din browser.'}
          </p>
          <LocaleLink
            href="/"
            onClick={() => { try { import("./Analytics").then(m => m.trackCTA("content-cta")); } catch {} }}
            className="inline-block bg-white text-red-800 font-black text-base md:text-lg px-8 py-4 rounded-2xl hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-black/30 mt-2"
          >
            🥚 {t('content.cta.button') || 'Ciocnește ouă online'}
          </LocaleLink>
        </div>
      </div>
    </motion.div>
  );
}
