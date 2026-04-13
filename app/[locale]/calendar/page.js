"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import LocaleLink from "../../components/LocaleLink";
import PageHeader from "../../components/PageHeader";
import ContentNav from "../../components/ContentNav";
import ContentCTA from "../../components/ContentCTA";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";

const datePaste = [
  { an: 2026, ortodox: "12 Aprilie", catolic: "5 Aprilie", special: false },
  { an: 2027, ortodox: "2 Mai", catolic: "28 Martie", special: false },
  { an: 2028, ortodox: "16 Aprilie", catolic: "16 Aprilie", special: true },
  { an: 2029, ortodox: "8 Aprilie", catolic: "1 Aprilie", special: false },
  { an: 2030, ortodox: "28 Aprilie", catolic: "21 Aprilie", special: false },
  { an: 2031, ortodox: "13 Aprilie", catolic: "13 Aprilie", special: true },
  { an: 2032, ortodox: "2 Mai", catolic: "28 Martie", special: false },
  { an: 2033, ortodox: "24 Aprilie", catolic: "17 Aprilie", special: false },
  { an: 2034, ortodox: "9 Aprilie", catolic: "9 Aprilie", special: true },
  { an: 2035, ortodox: "29 Aprilie", catolic: "25 Martie", special: false },
  { an: 2036, ortodox: "20 Aprilie", catolic: "13 Aprilie", special: false },
  { an: 2037, ortodox: "5 Aprilie", catolic: "5 Aprilie", special: true },
  { an: 2038, ortodox: "25 Aprilie", catolic: "25 Aprilie", special: true },
  { an: 2039, ortodox: "17 Aprilie", catolic: "10 Aprilie", special: false },
  { an: 2040, ortodox: "6 Mai", catolic: "1 Aprilie", special: false },
  { an: 2041, ortodox: "21 Aprilie", catolic: "21 Aprilie", special: true },
  { an: 2042, ortodox: "13 Aprilie", catolic: "6 Aprilie", special: false },
  { an: 2043, ortodox: "3 Mai", catolic: "29 Martie", special: false },
  { an: 2044, ortodox: "24 Aprilie", catolic: "17 Aprilie", special: false },
  { an: 2045, ortodox: "9 Aprilie", catolic: "9 Aprilie", special: true },
  { an: 2046, ortodox: "29 Aprilie", catolic: "25 Martie", special: false },
  { an: 2047, ortodox: "21 Aprilie", catolic: "14 Aprilie", special: false },
  { an: 2048, ortodox: "5 Aprilie", catolic: "5 Aprilie", special: true },
  { an: 2049, ortodox: "25 Aprilie", catolic: "18 Aprilie", special: false },
  { an: 2050, ortodox: "17 Aprilie", catolic: "10 Aprilie", special: false },
];

const monthMap = { 'Ianuarie': 0, 'Februarie': 1, 'Martie': 2, 'Aprilie': 3, 'Mai': 4, 'Iunie': 5, 'Iulie': 6, 'August': 7, 'Septembrie': 8, 'Octombrie': 9, 'Noiembrie': 10, 'Decembrie': 11 };

function localizeDate(roDateStr, locale) {
  const parts = roDateStr.split(' ');
  const day = parseInt(parts[0]);
  const month = monthMap[parts[1]];
  const date = new Date(2026, month, day);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

const INITIAL_SHOW = 5;

export default function CalendarPage() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const cal = t('content.calendar');

  const currentYear = new Date().getFullYear();
  const [showAll, setShowAll] = useState(false);
  const visibleDates = showAll ? datePaste : datePaste.slice(0, INITIAL_SHOW);

  const startYear = datePaste[0].an;
  const endYear = datePaste[datePaste.length - 1].an;

  return (
    <>
      <main className="min-h-screen bg-main text-body">
        <PageHeader />
        <ContentNav current="/calendar" />

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
              {cal.pageTitle} <span className="text-red-500">{cal.pageHighlight}</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              {t('content.calendar.pageSubtitle', { startYear, endYear })}
            </p>
          </header>

          <section className="space-y-4">
            {visibleDates.map((item, index) => (
              <motion.div
                key={item.an}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-lg shadow-lg transition-all ${
                  item.an === currentYear
                    ? "bg-red-900/20 border border-red-700/30 shadow-red-900/20 ring-1 ring-red-700/20"
                    : "bg-card border border-edge hover:border-red-900/30"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-3xl md:text-4xl font-black ${item.an === currentYear ? "text-red-500" : "text-heading"}`}>
                      {item.an}
                    </span>
                    {item.special && (
                      <span className="bg-yellow-900/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-700/30">
                        {cal.sameDay}
                      </span>
                    )}
                    {item.an === currentYear && (
                      <span className="bg-red-900/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-700/30">
                        {cal.currentYear}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wide">{cal.orthodox}</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === currentYear ? "text-heading" : "text-body"}`}>
                        {localizeDate(item.ortodox, locale)}
                      </div>
                    </div>
                    <div className="w-px bg-overlay"></div>
                    <div>
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wide">{cal.catholic}</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === currentYear ? "text-heading" : "text-body"}`}>
                        {localizeDate(item.catolic, locale)}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          {!showAll && (
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAll(true)}
                className="px-8 py-4 rounded-2xl bg-card border border-edge hover:border-red-700/40 hover:bg-elevated text-heading font-bold text-sm transition-all shadow-lg"
              >
                {t('content.calendar.showMore', { year: endYear })}
              </motion.button>
            </div>
          )}

          <article className="bg-card p-8 rounded-2xl border border-edge shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{cal.howIcon}</span>
              <h2 className="text-2xl md:text-3xl font-black text-heading">{cal.howTitle}</h2>
            </div>
            <div className="space-y-4 text-body font-medium leading-relaxed">
              {cal.howParagraphs.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
            </div>
          </article>

          <ContentCTA />
        </div>
      </main>
    </>
  );
}
