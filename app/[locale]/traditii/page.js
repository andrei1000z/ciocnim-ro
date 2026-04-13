"use client";

import { motion } from "framer-motion";
import Script from "next/script";
import LocaleLink from "../../components/LocaleLink";
import PageHeader from "../../components/PageHeader";
import ContentNav from "../../components/ContentNav";
import ContentCTA from "../../components/ContentCTA";
import { useT } from "../../i18n/useT";

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article
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
  </motion.article>
);

export default function TraditiiPage() {
  const t = useT();
  const traditions = t('content.traditions');

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": traditions.faq.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };

  return (
    <>
      <Script id="schema-traditii" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-main text-body">

        <PageHeader />
        <ContentNav current="/traditii" />

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">

          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
              {traditions.pageTitle.replace(traditions.pageHighlight, '').trim()} <span className="text-red-500">{traditions.pageHighlight}</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              {traditions.pageSubtitle}
            </p>
          </header>

          <section className="space-y-6">
            {traditions.sections.map((section, i) => (
              <ArticleSection key={i} title={section.title} icon={section.icon} delay={i * 0.05}>
                {section.paragraphs?.map((p, j) => <p key={j} dangerouslySetInnerHTML={{ __html: p }} />)}
                {section.rules && (
                  <ul className="list-disc pl-6 space-y-3 mt-4">
                    {section.rules.map((r, j) => (
                      <li key={j}><strong className="text-red-400 uppercase tracking-wider text-xs">{r.label}:</strong> {r.desc}</li>
                    ))}
                  </ul>
                )}
                {section.highlight && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-700/30 rounded-2xl">
                    <p className="text-red-400 font-black italic text-center text-sm md:text-base">{section.highlight}</p>
                  </div>
                )}
                {section.colors && (
                  <ul className="space-y-3 mt-4">
                    {section.colors.map((c, j) => (
                      <li key={j}><strong className={`${c.color} uppercase tracking-wider text-xs`}>{c.label}:</strong> {c.desc}</li>
                    ))}
                  </ul>
                )}
                {section.tips && (
                  <ul className="list-disc pl-6 space-y-3 mt-4">
                    {section.tips.map((tip, j) => <li key={j}>{tip}</li>)}
                  </ul>
                )}
              </ArticleSection>
            ))}
          </section>

          <ContentCTA />

        </div>
      </main>
    </>
  );
}
