"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";

// ─── WhatsApp share helper ──────────────────────────────────────────────────
const shareWhatsApp = (text) => {
  const encoded = encodeURIComponent(`${text}\n\n🥚 Hai la o ciocneală online pe https://ciocnim.ro`);
  window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank", "noopener");
};

// ─── Message Card ───────────────────────────────────────────────────────────
const MessageCard = ({ text, index }) => {
  const [copiat, setCopiat] = useState(false);

  const handleCopy = async () => {
    try {
      const textDeCopiat = `${text}\n🥚 Hai la o ciocneală online pe https://ciocnim.ro`;
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
      className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.06] hover:border-red-900/30 transition-all group relative"
    >
      <p className="text-gray-300 text-sm md:text-base font-medium italic pr-24 leading-relaxed select-text">
        &ldquo;{text}&rdquo;
      </p>
      <div className="absolute top-4 right-4 flex gap-1.5">
        <button
          onClick={() => shareWhatsApp(text)}
          className="px-2.5 py-2 rounded-lg text-xs font-black transition-all bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/30 active:scale-95"
          title="Trimite pe WhatsApp"
        >
          💬
        </button>
        <button
          onClick={handleCopy}
          className={`px-2.5 py-2 rounded-lg text-xs font-black transition-all active:scale-95 ${
            copiat
              ? "bg-green-900/20 text-green-400 border border-green-900/30"
              : "bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30"
          }`}
          title="Copiază Mesajul"
        >
          {copiat ? "✅" : "📋"}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Category Section ───────────────────────────────────────────────────────
const CategorySection = ({ title, icon, messages, delay = 0, startIndex = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-white/[0.04] p-6 md:p-8 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
      <span className="text-3xl">{icon}</span>
      <h2 className="text-xl md:text-2xl font-black text-white">{title}</h2>
    </div>
    <div className="flex flex-col gap-3">
      {messages.map((msg, idx) => (
        <MessageCard key={idx} text={msg} index={startIndex + idx} />
      ))}
    </div>
  </motion.section>
);

// ─── Greeting Card Generator ────────────────────────────────────────────────
const GreetingGenerator = () => {
  const [nume, setNume] = useState("");
  const [generated, setGenerated] = useState(false);
  const cardRef = useRef(null);

  const templates = [
    (n) => `Dragă ${n}, fie ca Lumina Sfântă a Învierii să îți aducă în suflet pace, bucurie și sănătate. Hristos a Înviat!`,
    (n) => `${n}, îți doresc un Paște plin de lumină, iubire și momente frumoase alături de cei dragi. Paște Fericit!`,
    (n) => `Pentru ${n}: Sărbătoarea Învierii să îți aducă binecuvântare și speranță. Hristos a Înviat! Adevărat a Înviat!`,
    (n) => `Scump(ă) ${n}, fie ca ouăle roșii să îți poarte noroc și fericire tot anul. Un Paște minunat!`,
  ];

  const [currentTemplate, setCurrentTemplate] = useState(0);
  const greetingText = templates[currentTemplate](nume || "...");

  const handleGenerate = () => {
    if (!nume.trim()) return;
    setCurrentTemplate(Math.floor(Math.random() * templates.length));
    setGenerated(true);
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
      className="bg-white/[0.04] p-6 md:p-8 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20"
    >
      <div className="flex items-center gap-3 mb-6 border-b border-red-900/20 pb-4">
        <span className="text-3xl">🎨</span>
        <h2 className="text-xl md:text-2xl font-black text-white">Generator de Felicitări</h2>
      </div>
      <p className="text-gray-400 text-sm mb-5">Introdu numele persoanei și generează un card personalizat.</p>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Numele persoanei..."
          value={nume}
          onChange={(e) => setNume(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          maxLength={30}
          className="flex-1 bg-white/[0.05] border border-red-900/30 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all"
        />
        <button
          onClick={handleGenerate}
          className="px-6 py-3 bg-red-700 text-white font-bold rounded-xl border border-red-800 hover:bg-red-600 transition-all active:scale-95 whitespace-nowrap"
        >
          Generează
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
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400 mb-3">Felicitare de Paște</p>
                <p className="text-lg md:text-xl text-gray-200 font-medium italic leading-relaxed select-text">
                  &ldquo;{greetingText}&rdquo;
                </p>
                <p className="mt-4 text-right text-xs text-gray-500">— ciocnim.ro</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4 justify-center">
              <button
                onClick={handleShareWhatsApp}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/30 transition-all active:scale-95"
              >
                💬 WhatsApp
              </button>
              <button
                onClick={handleCopyCard}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30 transition-all active:scale-95"
              >
                📋 Copiază
              </button>
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-white/[0.05] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1] transition-all active:scale-95"
              >
                🔄 Alt model
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
  const mesajeTraditionale = [
    "Fie ca Lumina Sfântă a Învierii să vă inunde sufletul și casa cu pace, bucurie și sănătate. Hristos a Înviat!",
    "Sărbătoarea Învierii Domnului să vă aducă armonie în familie, putere de a ierta și speranță pentru un viitor mai bun. Paște fericit!",
    "Bucuria Învierii să vă aducă în suflet liniște și pace. Sărbători binecuvântate alături de toți cei dragi. Hristos a Înviat!"
  ];

  const mesajeScurte = [
    "Lumină, pace și bucurie! Hristos a Înviat!",
    "Un Paște fericit alături de cei dragi! Adevărat a Înviat!",
    "Sărbători luminoase și un ou roșu norocos! Hristos a Înviat!",
    "Lumina Sfântă să vă călăuzească pașii. Paște fericit!"
  ];

  const mesajeAmuzante = [
    "Anul ăsta am cel mai tare ou, așa că pregătește-te de înfrângere! Până ne vedem la ciocnit, Hristos a Înviat!",
    "Fie ca oul tău să fie la fel de tare ca parolele pe care le uiți mereu. Paște fericit și Hristos a Înviat!",
    "Sper să nu te doară burta de la atâta drob, că avem de ciocnit ouă! Paște fericit!",
    "Am vopsit ouăle, am tăiat mielul, mai lipsești tu să pierzi la ciocnit! Hristos a Înviat!"
  ];

  const mesajeSpirituale = [
    "Hristos a Înviat din morți, cu moartea pe moarte călcând! Să ne bucurăm de minunea Învierii și să purtăm lumina în suflet mereu.",
    "În noaptea Învierii, cerul se deschide pentru a lăsa harul divin să coboare pe pământ. Sărbători pline de har!",
    "Dumnezeu să vă binecuvânteze casa și să vă apere de toate relele. Lumina din noaptea de Paște să vă arate calea cea bună."
  ];

  const allMessages = [...mesajeTraditionale, ...mesajeScurte, ...mesajeAmuzante, ...mesajeSpirituale];

  // ItemList Schema (JSON-LD)
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Mesaje și Urări de Paște",
    "description": "Colecție de mesaje și urări de Paște tradiționale, scurte, amuzante și spirituale.",
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
              Mesaje și <span className="text-red-500">Urări de Paște</span>
            </h1>
            <p className="text-gray-400 font-bold text-sm md:text-base">
              Copiază un mesaj și trimite vestea Învierii pe WhatsApp sau Facebook.
            </p>
          </header>

          {/* Greeting Generator */}
          <GreetingGenerator />

          <div className="space-y-6">
            <CategorySection title="Tradiționale & De Familie" icon="🕊️" messages={mesajeTraditionale} delay={0.05} startIndex={0} />
            <CategorySection title="Scurte (Pentru SMS)" icon="📱" messages={mesajeScurte} delay={0.1} startIndex={mesajeTraditionale.length} />
            <CategorySection title="Pentru Prieteni (Amuzante)" icon="😂" messages={mesajeAmuzante} delay={0.15} startIndex={mesajeTraditionale.length + mesajeScurte.length} />
            <CategorySection title="Duhovnicești & Spirituale" icon="✨" messages={mesajeSpirituale} delay={0.2} startIndex={mesajeTraditionale.length + mesajeScurte.length + mesajeAmuzante.length} />
          </div>

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
