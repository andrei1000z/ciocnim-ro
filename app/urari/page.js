"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - MESAJE ȘI URĂRI (V27.0 - VIRAL & SEO)
 * ====================================================================================================
 */

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const MessageCard = ({ text }) => {
  const [copiat, setCopiat] = useState(false);

  const handleCopy = async () => {
    try {
      // Adăugăm automat și link-ul site-ului la finalul mesajului copiat (crește viralitatea)
      const textDeCopiat = `${text} 🥚 Hai la o ciocneală online pe https://ciocnim.ro`;
      await navigator.clipboard.writeText(textDeCopiat);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group relative">
      <p className="text-white/80 text-sm md:text-base font-medium italic pr-12 leading-relaxed">
        "{text}"
      </p>
      <button 
        onClick={handleCopy}
        className={`absolute top-4 right-4 p-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          copiat 
            ? "bg-green-500/20 text-green-400 border border-green-500/30" 
            : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/10"
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
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } }
    }}
    className="bg-white/5 p-6 md:p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-xl relative overflow-hidden"
  >
    <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-white/10 pb-4">
      <span className="text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{icon}</span>
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white/90">{title}</h2>
    </div>
    <div className="flex flex-col gap-3 relative z-10">
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
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#010101] text-white selection:bg-red-600/30 pattern-tradition">
      
      {/* OLED GLOWS */}
      <div className="ambient-glow-red"></div>
      <div className="ambient-glow-gold"></div>

      {/* HEADER SIMPLU */}
      <div className="w-full flex justify-between items-center p-6 md:p-8 absolute top-0 left-0 z-50">
         <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🥚</span>
            <span className="font-bold text-lg md:text-xl tracking-tight">Ciocnim<span className="text-red-600">.ro</span></span>
         </Link>
         <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all shadow-lg active:scale-95">
            Înapoi
         </Link>
      </div>

      <div className="w-full max-w-3xl mx-auto pt-32 pb-24 px-5 flex flex-col gap-12 relative z-10">
        
        <motion.header initial="hidden" animate="visible" variants={fadeUpVariant} className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none drop-shadow-lg">
            MESAJE ȘI <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-500">URĂRI</span>
          </h1>
          <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
            Copiază un mesaj și trimite vestea Învierii pe WhatsApp.
          </p>
        </motion.header>
        
        <div className="flex flex-col gap-8 w-full mt-6">
          <CategorySection title="Tradiționale & De Familie" icon="🕊️" messages={mesajeTraditionale} delay={0.1} />
          <CategorySection title="Scurte (Pentru SMS)" icon="📱" messages={mesajeScurte} delay={0.2} />
          <CategorySection title="Pentru Prieteni (Amuzante)" icon="😂" messages={mesajeAmuzante} delay={0.3} />
          <CategorySection title="Duhovnicești & Spirituale" icon="✨" messages={mesajeSpirituale} delay={0.4} />
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full flex justify-center mt-12">
          <Link href="/" className="group relative bg-red-600 px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-white hover:scale-105 transition-all duration-300 shadow-[0_15px_40px_rgba(220,38,38,0.4)] overflow-hidden text-center">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
              Ciocnește ouă online
            </span>
          </Link>
        </motion.div>

      </div>
    </main>
  );
}