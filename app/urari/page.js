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
      const textDeCopiat = `${text} \n🥚 Hai la o ciocneală online pe https://ciocnim.ro`;
      await navigator.clipboard.writeText(textDeCopiat);
      setCopiat(true);
      setTimeout(() => setCopiat(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border-2 border-red-700 hover:border-red-800 transition-colors group relative shadow-lg">
      <p className="text-gray-800 text-sm md:text-base font-medium italic pr-12 leading-relaxed">
        "{text}"
      </p>
      <button 
        onClick={handleCopy}
        className={`absolute top-4 right-4 p-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
          copiat 
            ? "bg-green-100 text-green-700 border border-green-300" 
            : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
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
    className="bg-white p-6 md:p-10 rounded-[2.5rem] border-4 border-red-700 shadow-2xl relative overflow-hidden"
  >
    <div className="flex items-center gap-3 mb-6 relative z-10 border-b-2 border-red-200 pb-4">
      <span className="text-3xl md:text-4xl drop-shadow-[0_0_10px_rgba(255,0,0,0.2)]">{icon}</span>
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest text-red-700">{title}</h2>
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
    <>
      <main className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-900 selection:bg-red-600/30 pattern-tradition">
        
        {/* Traditional Easter decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-10">💌</div>
          <div className="absolute top-20 right-20 text-4xl opacity-10">🕊️</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-10">🌸</div>
          <div className="absolute bottom-10 right-10 text-3xl opacity-10">🌷</div>
        </div>

        {/* HEADER SIMPLU */}
        <div className="w-full flex justify-between items-center p-6 md:p-8 absolute top-0 left-0 z-50">
           <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🥚</span>
              <span className="font-bold text-lg md:text-xl tracking-tight text-red-700">Ciocnim<span className="text-red-600">.ro</span></span>
           </Link>
           <Link href="/" className="px-6 py-3 bg-red-700 border-2 border-red-700 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-white hover:bg-red-800 hover:border-red-800 transition-all shadow-lg active:scale-95">
              Înapoi
           </Link>
        </div>

        <div className="w-full max-w-3xl mx-auto pt-32 pb-24 px-5 flex flex-col gap-12 relative z-10">
          
          <motion.header initial="hidden" animate="visible" variants={fadeUpVariant} className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-red-700 italic tracking-tighter leading-none drop-shadow-lg">
              MESAJE ȘI <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-red-600">URĂRI</span>
            </h1>
            <p className="text-gray-700 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
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
            <Link href="/" className="group relative bg-red-700 px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-white hover:bg-red-800 transition-all duration-300 shadow-[0_15px_40px_rgba(220,38,38,0.4)] overflow-hidden text-center">
              <div className="absolute inset-0 bg-yellow-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-3 drop-shadow-md">
                Ciocnește ouă online
              </span>
            </Link>
          </motion.div>

        </div>
      </main>
    </>
  );
}