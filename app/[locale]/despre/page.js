"use client";

import { motion } from "framer-motion";
import LocaleLink from "../../components/LocaleLink";
import PageHeader from "../../components/PageHeader";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";

const Section = ({ title, icon, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-card p-8 rounded-2xl border border-edge shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-4 mb-6">
      <span className="text-4xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-black text-heading">{title}</h2>
    </div>
    <div className="space-y-4 text-body text-sm md:text-base font-medium leading-relaxed">
      {children}
    </div>
  </motion.section>
);

export default function DesprePage() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const despre = t('content.despre');

  return (
    <main className="min-h-screen bg-main text-body">
      <PageHeader />

      <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
            {despre.pageTitle} <span className="text-red-500">{t('seo.siteName')}</span>
          </h1>
          <p className="text-dim font-bold text-sm md:text-base">
            {despre.pageSubtitle}
          </p>
        </header>

        {despre.sections.map((section, i) => (
          <Section key={i} title={section.title} icon={section.icon} delay={i * 0.05}>
            {section.paragraphs?.map((p, j) => <p key={j} dangerouslySetInnerHTML={{ __html: p }} />)}
            {section.list && (
              <ul className="list-disc pl-6 space-y-2 mt-3">
                {section.list.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            )}
            {section.features && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {section.features.map(item => (
                  <div key={item.label} className="bg-elevated p-3 rounded-xl border border-edge">
                    <span className="text-xl">{item.icon}</span>
                    <p className="font-bold text-xs text-heading mt-1">{item.label}</p>
                    <p className="text-[11px] text-muted">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        ))}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <LocaleLink
            href="/"
            className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg text-center"
          >
            {despre.ctaOnline}
          </LocaleLink>
          <LocaleLink
            href="/ghid"
            className="inline-block bg-card text-heading px-8 py-4 rounded-2xl font-black text-lg border border-edge hover:bg-elevated transition-all active:scale-95 text-center"
          >
            {t('seo.guideLink')}
          </LocaleLink>
        </div>
      </div>
    </main>
  );
}
