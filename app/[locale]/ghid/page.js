"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import LocaleLink from "../../components/LocaleLink";
import PageHeader from "../../components/PageHeader";
import ContentNav from "../../components/ContentNav";
import ContentCTA from "../../components/ContentCTA";
import RelatedContent from "../../components/RelatedContent";
import { useT } from "../../i18n/useT";

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-edge rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-elevated transition-all"
      >
        <span className="font-bold text-sm text-heading">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-dim text-sm flex-shrink-0 ml-2"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-body leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GhidPage() {
  const t = useT();
  const guide = t('content.guide');

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": `${guide.pageTitle} ${guide.pageHighlight}`,
    "description": guide.pageSubtitle,
    "step": guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.desc,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": guide.faq.map((item) => ({
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
      <Script id="schema-ghid" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script id="schema-ghid-faq" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="bg-main text-body">
        <PageHeader />
        <ContentNav current="/ghid" />

        <div className="w-full max-w-3xl mx-auto pt-6 pb-12 px-6 space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
              {guide.pageTitle} <span className="text-red-500">{guide.pageHighlight}</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              {guide.pageSubtitle}
            </p>
          </header>

          {/* Steps */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-heading flex items-center gap-2">
              <span>📋</span> {guide.stepsLabel}
            </h2>
            {guide.steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="bg-card p-5 rounded-2xl border border-edge shadow-sm flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center">
                  <span className="text-xl">{step.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{guide.stepsLabel.split(' ')[0]} {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-heading text-sm mb-1">{step.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{step.desc}</p>
                  {step.tip && (
                    <p className="text-xs text-amber-400 mt-2 italic">💡 {step.tip}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-heading flex items-center gap-2">
              <span>❓</span> {guide.faqLabel}
            </h2>
            <div className="space-y-2">
              {guide.faq.map((item, i) => (
                <FAQItem key={i} item={item} index={i} />
              ))}
            </div>
          </section>

          <RelatedContent currentSlug="ghid" />
          <ContentCTA />
        </div>
      </div>
    </>
  );
}
