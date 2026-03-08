"use client";

/**
 * ====================================================================================================
 * CIOCNIM.RO - PAGINA DE TRADIȚII ȘI SEO (V26.0 - PURE LORE & IMMERSION)
 * ====================================================================================================
 */

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
    viewport={{ once: true, margin: "-50px" }}
    variants={{
      hidden: { opacity: 0, y: 50 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease: "easeOut" } }
    }}
    className="bg-white p-8 md:p-12 rounded-[2.5rem] border-4 border-red-700 shadow-2xl relative overflow-hidden group hover:border-red-800 transition-colors duration-500"
  >
    {/* Highlight subtil pe hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <span className="text-4xl md:text-5xl drop-shadow-[0_0_15px_rgba(255,0,0,0.2)] group-hover:scale-110 transition-transform duration-500">{icon}</span>
      <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-red-700">{title}</h2>
    </div>
    
    <div className="space-y-4 text-[13px] md:text-[15px] font-bold text-gray-800 leading-relaxed relative z-10">
      {children}
    </div>
  </motion.article>
);

export default function TraditiiPage() {
  return (
    <>
      <title>Tradiții Paște 2026 - Cum se ciocnesc ouăle corect | Ciocnim.ro</title>
      <meta name="description" content="Află de ce ciocnim ouă, semnificația culorilor și cum să câștigi bătălia de la masa de Paște. Reguli și tradiții românești autentice pentru Paștele din 2026." />
      <meta property="og:title" content="Tradiția ciocnitului de ouă - Reguli și Semnificații | Ciocnim.ro" />
      <meta property="og:description" content="Descoperă secretele din spatele celui mai popular joc tradițional românesc de Paște." />

      <main className="relative min-h-screen w-full overflow-x-hidden bg-yellow-50 text-gray-900 selection:bg-red-600/30 pattern-tradition">
        
        {/* Traditional Easter decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 text-6xl opacity-10">🥚</div>
          <div className="absolute top-20 right-20 text-4xl opacity-10">🐔</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-10">🌸</div>
          <div className="absolute bottom-10 right-10 text-3xl opacity-10">🌷</div>
        </div>

        {/* HEADER SIMPLU PENTRU NAVIGARE */}
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
              TRADIȚIA <br className="md:hidden" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800">CIOCNITULUI</span>
            </h1>
            <p className="text-gray-700 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed">
              Află regulile jocului de Paște care a unit generații.
            </p>
          </motion.header>
          
          <section className="flex flex-col gap-8 w-full mt-6">
            
            <ArticleSection title="De ce ciocnim ouă?" icon="🩸" delay={0.1}>
              <p>
                Tradiția ciocnitului ouălor de Paște este una dintre cele mai vechi datini din România. Legenda spune că Sfânta Maria Magdalena, ajungând la Roma, i-ar fi oferit împăratului Tiberiu un ou roșu, rostind cuvintele <strong className="text-white">"Hristos a Înviat!"</strong>.
              </p>
              <p>
                Culoarea roșie simbolizează sângele vărsat de Mântuitor, iar ciocnitul oului reprezintă deschiderea Sfântului Mormânt. Astăzi, acest joc a devenit un prilej de bucurie și reunire a familiei.
              </p>
            </ArticleSection>

            <ArticleSection title="Regulile Nescrise" icon="📜" delay={0.2}>
              <p>Dacă te-ai întrebat vreodată cum se ciocnesc ouăle corect, există un protocol simplu păstrat din tată-n fiu:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong className="text-white uppercase tracking-wider text-xs">Cap la Cap:</strong> Regula primei zile de Paște (Duminică).</li>
                <li><strong className="text-white uppercase tracking-wider text-xs">Cap la Dos:</strong> Permis abia începând cu a doua zi (Luni).</li>
                <li><strong className="text-white uppercase tracking-wider text-xs">Dos la Dos:</strong> Rezervat strict pentru a treia zi de sărbătoare.</li>
              </ul>
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-700 rounded-2xl shadow-inner">
                 <p className="text-red-700 font-black italic text-center text-sm md:text-base">
                   Cel care lovește zice "Hristos a Înviat!", iar celălalt răspunde "Adevărat a Înviat!"
                 </p>
              </div>
            </ArticleSection>

            <ArticleSection title="Semnificația Culorilor" icon="🎨" delay={0.3}>
              <p>Deși oul roșu este cel mai cunoscut, tradiția românească a păstrat și alte culori, fiecare având un sens aparte:</p>
              <ul className="space-y-3 mt-4">
                <li><strong className="text-red-500 uppercase tracking-wider text-xs">ROȘU:</strong> Simbolul jertfei, al vieții și al iubirii divine.</li>
                <li><strong className="text-yellow-500 uppercase tracking-wider text-xs">GALBEN:</strong> Reprezintă lumina, belșugul și grâul copt al verii ce urmează.</li>
                <li><strong className="text-blue-500 uppercase tracking-wider text-xs">ALBASTRU:</strong> Simbolizează cerul, credința și infinitul spiritual.</li>
                <li><strong className="text-green-500 uppercase tracking-wider text-xs">VERDE:</strong> Culoarea primăverii, a reînnoirii naturii și a speranței.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Cum Alegi Oul Tare" icon="🛡️" delay={0.4}>
              <p>Secretul câștigării duelurilor stă în alegerea oului potrivit din coș:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Caută un ou cu o formă cât mai ascuțită la vârf. Forța se concentrează mai bine pe o suprafață mică.</li>
                <li>Verifică sunetul! Unii bat ușor oul de dinte – dacă sună plin și ascuțit, coaja este groasă.</li>
                <li>Strânge-l ușor în mână. Oul trebuie să se simtă ferm, fără micro-fisuri ascunse sub stratul de vopsea.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Superstiții Românești" icon="✨" delay={0.5}>
              <p>Jocul nu este doar o competiție, ci și un mod de a atrage norocul în casă:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Cine are oul cel mai tare și iese învingător din toate duelurile, va fi sănătos și puternic tot restul anului.</li>
                <li>Dacă găsești la masă un ou cu două gălbenușuri, vei avea parte de noroc dublu.</li>
                <li>Cojile ouălor sparte și sfințite nu se aruncă la gunoi! Tradiția cere să le îngropi în pământul grădinii pentru a proteja recolta.</li>
              </ul>
            </ArticleSection>

          </section>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="w-full flex justify-center mt-12">
            <Link href="/" className="group relative bg-red-700 px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-white hover:bg-red-800 transition-all duration-300 shadow-[0_15px_40px_rgba(220,38,38,0.4)] overflow-hidden">
              <div className="absolute inset-0 bg-yellow-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-3 drop-shadow-md">
                INTRĂ ÎN ARENĂ ⚔️
              </span>
            </Link>
          </motion.div>

        </div>
      </main>
    </>
  );
}