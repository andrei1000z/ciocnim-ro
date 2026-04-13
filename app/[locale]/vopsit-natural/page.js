"use client";

import { motion } from "framer-motion";
import Script from "next/script";
import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";
import ContentNav from "../../components/ContentNav";
import ContentCTA from "../../components/ContentCTA";
import PageHeader from "../../components/PageHeader";

// ─── Article Section ────────────────────────────────────────────────────────
const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="p-8 rounded-2xl border shadow-lg shadow-black/20 bg-card border-edge"
  >
    <div className="flex items-center gap-4 mb-6">
      <span className="text-4xl">{icon}</span>
      <h2 className="font-black text-heading text-2xl md:text-3xl">{title}</h2>
    </div>
    <div className="space-y-4 font-medium leading-relaxed text-body text-sm md:text-base">
      {children}
    </div>
  </motion.article>
);

export default function VopsitNaturalPage() {
  const t = useT();
  const dyeing = t('content.dyeing');

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
      <div className="text-body bg-main">

        <PageHeader />
        <ContentNav current="/vopsit-natural" />

        <div className="w-full mx-auto pt-8 pb-16 px-6 space-y-8 max-w-4xl">

          <header className="text-center space-y-4">
            <h1 className="font-black text-white leading-tight text-4xl md:text-6xl">
              {dyeing.pageTitle} <span className="text-red-500">{dyeing.pageHighlight}</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              {dyeing.pageSubtitle}
            </p>
          </header>

          <section className="space-y-6">
            {dyeing.sections && dyeing.sections.map((section, i) => (
              <ArticleSection key={i} title={section.title} icon={section.icon} delay={i * 0.05}>
                {section.paragraphs?.map((p, j) => <p key={j}>{p}</p>)}
                {section.steps && (
                  <ol className="list-decimal pl-6 space-y-3 mt-4">
                    {section.steps.map((step, j) => <li key={j}>{step}</li>)}
                  </ol>
                )}
                {section.tips && (
                  <ul className="list-disc pl-6 space-y-3 mt-4">
                    {section.tips.map((tip, j) => <li key={j} dangerouslySetInnerHTML={{ __html: tip }} />)}
                  </ul>
                )}
                {section.highlight && (
                  <div className="mt-4 p-4 rounded-xl border bg-amber-900/10 border-amber-700/20">
                    <p className="font-bold italic text-center text-amber-400 text-sm md:text-base">
                      {section.highlight}
                    </p>
                  </div>
                )}
              </ArticleSection>
            ))}
          </section>

          <ContentCTA />

        </div>
      </div>
    </>
  );
}
