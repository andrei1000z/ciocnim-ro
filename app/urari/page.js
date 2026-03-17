"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const MessageCard = ({ text }) => {
  const [copiat, setCopiat] = useState(false);

  const handleCopy = async () => {
    try {
      const textDeCopiat = `${text} \n🥚 Hai la o ciocneală online pe https://ciocnim.ro`;
      await navigator.clipboard.writeText(textDeCopiat);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="bg-white/[0.03] p-5 rounded-xl border border-white/[0.06] hover:border-red-900/30 transition-colors group relative">
      <p className="text-gray-300 text-sm md:text-base font-medium italic pr-14 leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>
      <button
        onClick={handleCopy}
        className={`absolute top-4 right-4 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
          copiat
            ? "bg-green-900/20 text-green-400 border border-green-900/30"
            : "bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-900/30"
        }`}
        title="Copiază Mesajul"
      >
        {copiat ? "✅" : "📋"}
      </button>
    </div>
  );
};

const CategorySection = ({ title, icon, messages, delay = 0 }) => (
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
        <MessageCard key={idx} text={msg} />
      ))}
    </div>
  </motion.section>
);

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

  return (
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

        <div className="space-y-6">
          <CategorySection title="Tradiționale & De Familie" icon="🕊️" messages={mesajeTraditionale} delay={0.05} />
          <CategorySection title="Scurte (Pentru SMS)" icon="📱" messages={mesajeScurte} delay={0.1} />
          <CategorySection title="Pentru Prieteni (Amuzante)" icon="😂" messages={mesajeAmuzante} delay={0.15} />
          <CategorySection title="Duhovnicești & Spirituale" icon="✨" messages={mesajeSpirituale} delay={0.2} />
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg">
            🥚 Ciocnește ouă online
          </Link>
        </div>

      </div>
    </main>
  );
}
