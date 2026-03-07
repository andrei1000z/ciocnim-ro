"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - CALENDARUL PAȘTELUI (V27.0 - SEO MAGNET & LORE)
 * ====================================================================================================
 */

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const datePaste = [
  { an: 2026, ortodox: "12 Aprilie", catolic: "5 Aprilie", special: false },
  { an: 2027, ortodox: "2 Mai", catolic: "28 Martie", special: false },
  { an: 2028, ortodox: "16 Aprilie", catolic: "16 Aprilie", special: true }, // Pică în aceeași zi
  { an: 2029, ortodox: "8 Aprilie", catolic: "1 Aprilie", special: false },
  { an: 2030, ortodox: "28 Aprilie", catolic: "21 Aprilie", special: false },
];

export default function CalendarPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#010101] text-white selection:bg-red-600/30 pattern-tradition">
      
      {/* OLED GLOWS */}
      <div className="ambient-glow-red"></div>
      <div className="ambient-glow-gold"></div>

      {/* HEADER SIMPLU PENTRU NAVIGARE */}
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
            CALENDARUL <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-gold-glow">PAȘTELUI</span>
          </h1>
          <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
            Află când pică Sărbătorile Pascale între 2026 și 2030
          </p>
        </motion.header>
        
        <section className="w-full mt-6 flex flex-col gap-4">
          {datePaste.map((item, index) => (
            <motion.div 
              key={item.an}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row justify-between items-center p-6 md:p-8 rounded-[2rem] border backdrop-blur-3xl transition-all duration-300 ${
                item.an === 2026 
                  ? "bg-red-600/10 border-red-500/30 shadow-[0_10px_30px_rgba(220,38,38,0.15)] scale-[1.02]" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <span className={`text-4xl md:text-5xl font-black italic ${item.an === 2026 ? "text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "text-white/20"}`}>
                  {item.an}
                </span>
                {item.special && (
                  <span className="bg-yellow-500/20 text-yellow-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-500/30 animate-pulse">
                    Pică în aceeași zi
                  </span>
                )}
                {item.an === 2026 && (
                  <span className="bg-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-500/30">
                    Anul Curent
                  </span>
                )}
              </div>

              <div className="flex gap-8 w-full md:w-auto justify-between md:justify-end text-center md:text-right">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Ortodox</span>
                  <span className={`text-lg md:text-xl font-bold ${item.an === 2026 ? "text-white" : "text-white/80"}`}>{item.ortodox}</span>
                </div>
                <div className="w-px bg-white/10 hidden md:block"></div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Catolic</span>
                  <span className={`text-lg md:text-xl font-bold ${item.an === 2026 ? "text-white/80" : "text-white/60"}`}>{item.catolic}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* SECȚIUNE LORE / CUM SE CALCULEAZĂ (SEO GOLDMINE) */}
        <motion.article 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden mt-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">🌕</span>
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-white">Cum se calculează?</h2>
          </div>
          <div className="space-y-4 text-[13px] md:text-[15px] font-bold text-white/70 leading-relaxed">
            <p>
              Te-ai întrebat vreodată de ce Paștele își schimbă data în fiecare an, spre deosebire de Crăciun? 
              Regula a fost stabilită la Sinodul de la Niceea din anul 325.
            </p>
            <p>
              Paștele se sărbătorește întotdeauna în <strong className="text-yellow-500">prima duminică după prima Lună Plină</strong> care cade după sau chiar în ziua echinocțiului de primăvară (21 martie).
            </p>
            <p>
              Diferența dintre Paștele Ortodox și cel Catolic apare din cauza calendarului folosit. Biserica Catolică folosește calendarul Gregorian, în timp ce Biserica Ortodoxă calculează data Paștelui folosind vechiul calendar Iulian.
            </p>
          </div>
        </motion.article>

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