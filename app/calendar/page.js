"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - CALENDARUL PAȘTELUI (V27.0 - SEO MAGNET & LORE)
 * ====================================================================================================
 */

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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
  const currentYear = new Date().getFullYear();
  return (
    <>
      <main className="min-h-screen bg-[#0c0a0a] text-gray-200">
        
        {/* Header */}
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
          
          {/* Hero banner */}
          <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border border-white/[0.06]">
            <Image src="/pages/calendar-hero.webp" alt="Calendarul Paștelui" fill className="object-cover" sizes="(max-width: 768px) 100vw, 896px" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a0a] via-[#0c0a0a]/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                Calendarul <span className="text-red-500">Paștelui</span>
              </h1>
              <p className="text-gray-300 font-bold text-sm md:text-base mt-2 drop-shadow">
                Află când pică Sărbătorile Pascale între {datePaste[0].an} și {datePaste[datePaste.length - 1].an}
              </p>
            </div>
          </div>

          <header className="hidden">
          </header>
          
          <section className="space-y-4">
            {datePaste.map((item, index) => (
              <motion.div 
                key={item.an}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-lg shadow-lg transition-all ${
                  item.an === currentYear
                    ? "bg-red-900/20 border border-red-700/30 shadow-red-900/20 ring-1 ring-red-700/20"
                    : "bg-white/[0.04] border border-white/[0.06] hover:border-red-900/30"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-3xl md:text-4xl font-black ${item.an === currentYear ? "text-red-500" : "text-white"}`}>
                      {item.an}
                    </span>
                    {item.special && (
                      <span className="bg-yellow-900/30 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-700/30">
                        Aceeași zi
                      </span>
                    )}
                    {item.an === currentYear && (
                      <span className="bg-red-900/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-700/30">
                        Anul curent
                      </span>
                    )}
                  </div>

                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wide">Ortodox</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === currentYear ? "text-white" : "text-gray-200"}`}>
                        {item.ortodox}
                      </div>
                    </div>
                    <div className="w-px bg-white/10"></div>
                    <div>
                      <div className="text-xs font-bold text-red-500 uppercase tracking-wide">Catolic</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === currentYear ? "text-white" : "text-gray-200"}`}>
                        {item.catolic}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <article className="bg-white/[0.04] p-8 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🌕</span>
              <h2 className="text-2xl md:text-3xl font-black text-white">Cum se calculează Paștele?</h2>
            </div>
            <div className="space-y-4 text-gray-300 font-medium leading-relaxed">
              <p>
                Te-ai întrebat vreodată de ce Paștele își schimbă data în fiecare an, spre deosebire de Crăciun? 
                Regula a fost stabilită la Sinodul de la Niceea din anul 325.
              </p>
              <p>
                Paștele se sărbătorește întotdeauna în <strong className="text-red-400">prima duminică după prima Lună Plină</strong> care cade după sau chiar în ziua echinocțiului de primăvară (21 martie).
              </p>
              <p>
                Diferența dintre Paștele Ortodox și cel Catolic apare din cauza calendarului folosit. Biserica Catolică folosește calendarul Gregorian, în timp ce Biserica Ortodoxă calculează data Paștelui folosind vechiul calendar Iulian.
              </p>
            </div>
          </article>

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