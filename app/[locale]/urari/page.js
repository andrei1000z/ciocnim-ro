"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import LocaleLink from "../../components/LocaleLink";
import { useT } from "../../i18n/useT";
import { useLocaleConfig } from "../../components/DictionaryProvider";
import { getSiteUrl } from "../../lib/constants";
import PageHeader from "../../components/PageHeader";
import ContentNav from "../../components/ContentNav";

// ─── Message Card ───────────────────────────────────────────────────────────
const MessageCard = ({ text, index, greetings, locale }) => {
  const [copiat, setCopiat] = useState(false);

  const shareWhatsApp = (msg) => {
    const encoded = encodeURIComponent(`${msg}\n\n${greetings.shareFooter} ${getSiteUrl(locale)}/${locale}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank", "noopener");
  };

  const handleCopy = async () => {
    try {
      const textDeCopiat = `${text}\n${greetings.shareFooter} ${getSiteUrl(locale)}/${locale}`;
      await navigator.clipboard.writeText(textDeCopiat);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2000);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="bg-card p-5 rounded-xl border border-edge hover:border-red-900/30 transition-all group relative"
    >
      <p className="text-body text-sm md:text-base font-medium pr-24 leading-relaxed select-text">
        {text}
      </p>
      <div className="absolute top-4 right-4 flex gap-1.5">
        <button
          onClick={() => shareWhatsApp(text)}
          className="px-2.5 py-2 rounded-lg text-xs font-black transition-all bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/30 active:scale-95"
          title={greetings.whatsappTitle}
        >
          <img src="/whatsapp-icon.webp" alt="" width={14} height={14} />
        </button>
        <button
          onClick={handleCopy}
          className={`px-2.5 py-2 rounded-lg text-xs font-black transition-all active:scale-95 ${
            copiat
              ? "bg-green-900/20 text-green-400 border border-green-900/30"
              : "bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30"
          }`}
          title={greetings.copyTitle}
        >
          {copiat ? "✅" : "📋"}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Category Section ───────────────────────────────────────────────────────
const CategorySection = ({ title, icon, messages, delay = 0, startIndex = 0, greetings, locale }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-card p-6 md:p-8 rounded-2xl border border-edge shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
      <span className="text-3xl">{icon}</span>
      <h2 className="text-xl md:text-2xl font-black text-heading">{title}</h2>
    </div>
    <div className="flex flex-col gap-3">
      {messages.map((msg, idx) => (
        <MessageCard key={idx} text={msg} index={startIndex + idx} greetings={greetings} locale={locale} />
      ))}
    </div>
  </motion.section>
);

// ─── Greeting Card Generator ────────────────────────────────────────────────
const GreetingGenerator = ({ greetings, locale }) => {
  const [nume, setNume] = useState("");
  const [generated, setGenerated] = useState(false);
  const cardRef = useRef(null);

  const templates = greetings.templates || [];

  const [currentTemplate, setCurrentTemplate] = useState(0);
  const greetingText = templates.length > 0
    ? templates[currentTemplate]?.replace('{name}', nume || '...') || ''
    : '';

  const shareWhatsApp = (msg) => {
    const encoded = encodeURIComponent(`${msg}\n\n${greetings.shareFooter} ${getSiteUrl(locale)}/${locale}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank", "noopener");
  };

  const handleGenerate = () => {
    if (!nume.trim()) return;
    setCurrentTemplate(Math.floor(Math.random() * templates.length));
    setGenerated(true);
  };

  const handleNativeShare = () => {
    const text = `${greetingText}\n\n${greetings.shareFooter} ${getSiteUrl(locale)}/${locale}`;
    if (navigator.share) {
      navigator.share({ title: greetings.generatorTitle, text }).catch(() => {});
    } else {
      try { navigator.clipboard.writeText(text); } catch {}
    }
  };

  const handleShareWhatsApp = () => shareWhatsApp(greetingText);

  const handleCopyCard = async () => {
    try {
      await navigator.clipboard.writeText(greetingText);
    } catch {}
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-card p-6 md:p-8 rounded-2xl border border-edge shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
        <span className="text-3xl">🎨</span>
        <h2 className="text-xl md:text-2xl font-black text-heading">{greetings.generatorTitle}</h2>
      </div>
      <p className="text-dim text-sm mb-5">{greetings.generatorSubtitle}</p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder={greetings.generatorPlaceholder}
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          maxLength={30}
          className="flex-1 bg-elevated border border-red-900/30 rounded-xl px-4 py-3 text-heading placeholder:text-muted focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
        />
        <button
          onClick={handleGenerate}
          className="px-6 py-3 bg-red-700 text-white font-bold rounded-xl border border-red-800 hover:bg-red-600 transition-all active:scale-95 whitespace-nowrap"
        >
          {greetings.generatorButton}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {generated && nume.trim() && (
          <motion.div
            key={currentTemplate + nume}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div
              ref={cardRef}
              className="relative overflow-hidden rounded-2xl p-8 md:p-10 bg-gradient-to-br from-red-900/40 via-[#141111] to-amber-900/20 border border-red-700/30 shadow-xl"
            >
              <div className="absolute top-4 right-4 text-5xl opacity-20 select-none">🥚</div>
              <div className="absolute bottom-4 left-4 text-3xl opacity-10 select-none">✨</div>

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">{greetings.generatorTitle}</p>
                <p className="text-lg md:text-xl text-body font-medium leading-relaxed select-text">
                  {greetingText}
                </p>
                <p className="mt-4 text-right text-xs text-muted">— ciocnim.ro</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <button
                onClick={handleNativeShare}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30 transition-all active:scale-95"
              >
                📤 {greetings.generatorShare}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/30 transition-all active:scale-95"
              >
                <span className="flex items-center gap-1.5"><img src="/whatsapp-icon.webp" alt="" width={14} height={14} /> WhatsApp</span>
              </button>
              <button
                onClick={handleCopyCard}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-elevated text-body hover:bg-overlay border border-edge-strong transition-all active:scale-95"
              >
                📋 {greetings.generatorCopy}
              </button>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-elevated text-body hover:bg-overlay border border-edge-strong transition-all active:scale-95"
              >
                🔄 {greetings.generatorNext}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function UrariPage() {
  const t = useT();
  const { locale } = useLocaleConfig();
  const greetings = t('content.greetings');

  // Collect all messages from all categories for schema
  const allMessages = greetings.categories
    ? greetings.categories.flatMap(cat => cat.messages)
    : [];

  // ItemList Schema (JSON-LD)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": greetings.pageTitle,
    "description": greetings.pageSubtitle,
    "numberOfItems": allMessages.length,
    "itemListElement": allMessages.map((msg, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": msg.length > 60 ? msg.substring(0, 60) + "…" : msg,
      "description": msg
    }))
  };

  return (
    <>
      <Script id="schema-urari" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <main className="min-h-screen bg-main text-body">

        <PageHeader />
        <ContentNav current="/urari" />

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">

          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
              {greetings.pageTitle} <span className="text-red-500">{greetings.pageHighlight}</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              {greetings.pageSubtitle}
            </p>
          </header>

          {/* Greeting Generator */}
          <GreetingGenerator greetings={greetings} locale={locale} />

          <div className="space-y-6">
            {greetings.categories && greetings.categories.map((cat, i) => {
              const startIndex = greetings.categories.slice(0, i).reduce((acc, c) => acc + (c.messages?.length || 0), 0);
              return (
                <CategorySection
                  key={i}
                  title={cat.title}
                  icon={cat.icon}
                  messages={cat.messages}
                  delay={(i + 1) * 0.05}
                  startIndex={startIndex}
                  greetings={greetings}
                  locale={locale}
                />
              );
            })}
          </div>

          <div className="text-center">
            <LocaleLink href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
              {greetings.ctaOnline || "🥚 Ciocneste oua online"}
            </LocaleLink>
          </div>

        </div>
      </main>
    </>
  );
}
