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
    <>
      <title>Când pică Paștele Ortodox și Catolic în 2026? Calendar complet | Ciocnim.ro</title>
      <meta name="description" content="Află datele exacte pentru Paștele Ortodox și Catolic între anii 2026 și 2030. Cum se calculează data Paștelui și de ce se schimbă în fiecare an." />
      <meta property="og:title" content="Calendarul Paștelui - Află când pică în 2026" />
      <meta property="og:description" content="Verifică datele pentru Paștele Ortodox și cel Catolic." />

      <main className="min-h-screen bg-yellow-50 text-red-900">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-white shadow-lg border-b-4 border-red-700">
           <Link href="/" className="flex items-center gap-2 group">
              <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
              <span className="font-bold text-xl md:text-2xl text-red-900">Ciocnim<span className="text-red-600">.ro</span></span>
           </Link>
           <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border-2 border-red-900 hover:bg-red-800 transition-all active:scale-95">
              Înapoi acasă
           </Link>
        </div>

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">
          
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-red-900 leading-tight">
              Calendarul <span className="text-red-600">Paștelui</span>
            </h1>
            <p className="text-red-700 font-bold text-sm md:text-base">
              Află când pică Sărbătorile Pascale între 2026 și 2030
            </p>
          </header>
          
          <section className="space-y-4">
            {datePaste.map((item, index) => (
              <motion.div 
                key={item.an}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-lg border-4 shadow-lg transition-all ${
                  item.an === 2026 
                    ? "bg-red-100 border-red-700 shadow-red-200" 
                    : "bg-white border-red-300 hover:border-red-500"
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className={`text-3xl md:text-4xl font-black ${item.an === 2026 ? "text-red-700" : "text-red-600"}`}>
                      {item.an}
                    </span>
                    {item.special && (
                      <span className="bg-yellow-200 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-600">
                        Aceeași zi
                      </span>
                    )}
                    {item.an === 2026 && (
                      <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-700">
                        Anul curent
                      </span>
                    )}
                  </div>

                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Ortodox</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === 2026 ? "text-red-900" : "text-red-800"}`}>
                        {item.ortodox}
                      </div>
                    </div>
                    <div className="w-px bg-red-300"></div>
                    <div>
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Catolic</div>
                      <div className={`text-xl md:text-2xl font-black ${item.an === 2026 ? "text-red-800" : "text-red-700"}`}>
                        {item.catolic}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <article className="bg-white p-8 rounded-lg border-4 border-red-700 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🌕</span>
              <h2 className="text-2xl md:text-3xl font-black text-red-900">Cum se calculează Paștele?</h2>
            </div>
            <div className="space-y-4 text-red-800 font-medium leading-relaxed">
              <p>
                Te-ai întrebat vreodată de ce Paștele își schimbă data în fiecare an, spre deosebire de Crăciun? 
                Regula a fost stabilită la Sinodul de la Niceea din anul 325.
              </p>
              <p>
                Paștele se sărbătorește întotdeauna în <strong className="text-red-900">prima duminică după prima Lună Plină</strong> care cade după sau chiar în ziua echinocțiului de primăvară (21 martie).
              </p>
              <p>
                Diferența dintre Paștele Ortodox și cel Catolic apare din cauza calendarului folosit. Biserica Catolică folosește calendarul Gregorian, în timp ce Biserica Ortodoxă calculează data Paștelui folosind vechiul calendar Iulian.
              </p>
            </div>
          </article>

          <div className="text-center">
            <Link href="/" className="inline-block bg-red-700 text-white px-8 py-4 rounded-lg font-black text-lg border-4 border-red-900 hover:bg-red-800 transition-all active:scale-95 shadow-lg">
              🥚 Ciocnește ouă online
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}