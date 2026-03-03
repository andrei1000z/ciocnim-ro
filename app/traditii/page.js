"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article 
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } }
    }}
    className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl relative overflow-hidden group"
  >
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <span className="text-4xl md:text-5xl drop-shadow-md">{icon}</span>
      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-white">{title}</h2>
    </div>
    <div className="space-y-4 text-[13px] md:text-[15px] font-bold text-white/70 leading-relaxed relative z-10">
      {children}
    </div>
  </motion.article>
);

export default function TraditiiPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-[#050505] text-white">
      
      {/* HEADER SIMPLU PENTRU NAVIGARE */}
      <div className="w-full flex justify-between items-center p-6 absolute top-0 left-0 z-50">
         <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🥚</span>
            <span className="font-bold text-lg tracking-tight">Ciocnim<span className="text-red-500">.ro</span></span>
         </Link>
         <Link href="/" className="px-5 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
            Înapoi
         </Link>
      </div>

      <div className="w-full max-w-3xl mx-auto pt-32 pb-24 px-5 flex flex-col gap-12">
        
        <motion.header initial="hidden" animate="visible" variants={fadeUpVariant} className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-none">
            TRADIȚIA <br className="md:hidden" /><span className="text-red-600">CIOCNITULUI</span>
          </h1>
          <p className="text-white/50 text-xs md:text-sm font-bold uppercase tracking-widest leading-relaxed">
            Află regulile jocului de Paște care a unit generații.
          </p>
        </motion.header>
        
        <section className="flex flex-col gap-8 w-full mt-6">
          <ArticleSection title="De ce ciocnim ouă?" icon="🩸" delay={0.1}>
            <p>
              Tradiția ciocnitului ouălor de Paște este una dintre cele mai vechi datini din România. Legenda spune că Sfânta Maria Magdalena, ajungând la Roma, i-ar fi oferit împăratului Tiberiu un ou roșu, rostind cuvintele <strong>"Hristos a Înviat!"</strong>.
            </p>
            <p>
              Culoarea roșie simbolizează sângele vărsat de Mântuitor, iar ciocnitul oului reprezintă deschiderea Sfântului Mormânt. Astăzi, acest joc a devenit un prilej de bucurie în familie.
            </p>
          </ArticleSection>

          <ArticleSection title="Regulile Nescrise" icon="📜" delay={0.2}>
            <p>Dacă te-ai întrebat vreodată cum se ciocnesc ouăle corect, există un protocol simplu:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Cap la Cap:</strong> Regula primei zile de Paște (duminică).</li>
              <li><strong>Cap la Dos:</strong> Permis începând cu a doua zi (luni).</li>
              <li><strong>Dos la Dos:</strong> Rezervat pentru a treia zi.</li>
            </ul>
            <p className="mt-4">
               Cel care lovește primul rostește "Hristos a Înviat!", iar cel care ține oul răspunde cu "Adevărat a Înviat!".
            </p>
          </ArticleSection>
        </section>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full flex justify-center mt-8">
          <Link href="/" className="bg-red-600 px-8 py-4 rounded-full font-black uppercase tracking-widest text-white hover:scale-105 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)]">
            Joacă Acum
          </Link>
        </motion.div>

      </div>
    </main>
  );
}