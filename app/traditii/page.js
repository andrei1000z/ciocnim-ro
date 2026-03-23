"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import ContentNav from "../components/ContentNav";

const ArticleSection = ({ title, icon, children, delay = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-white/[0.04] p-8 rounded-2xl border border-white/[0.06] shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-4 mb-6">
      <span className="text-4xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-black text-white">{title}</h2>
    </div>
    <div className="space-y-4 text-gray-300 text-sm md:text-base font-medium leading-relaxed">
      {children}
    </div>
  </motion.article>
);

export default function TraditiiPage() {
  // FAQPage Schema (JSON-LD)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "De ce ciocnim ouă de Paște?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tradiția ciocnitului ouălor de Paște este una dintre cele mai vechi datini din România. Legenda spune că Sfânta Maria Magdalena, ajungând la Roma, i-ar fi oferit împăratului Tiberiu un ou roșu, rostind cuvintele 'Hristos a Înviat!'. Culoarea roșie simbolizează sângele vărsat de Mântuitor, iar ciocnitul oului reprezintă deschiderea Sfântului Mormânt."
        }
      },
      {
        "@type": "Question",
        "name": "Care sunt regulile ciocnitului de ouă?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Regulile tradiționale: Cap la Cap – regula primei zile de Paște (Duminică). Cap la Dos – permis abia începând cu a doua zi (Luni). Dos la Dos – rezervat strict pentru a treia zi de sărbătoare. Cel care lovește zice 'Hristos a Înviat!', iar celălalt răspunde 'Adevărat a Înviat!'."
        }
      },
      {
        "@type": "Question",
        "name": "Ce semnifică culorile ouălor de Paște?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Roșu – simbolul jertfei, al vieții și al iubirii divine. Galben – reprezintă lumina, belșugul și grâul copt al verii. Albastru – simbolizează cerul, credința și infinitul spiritual. Verde – culoarea primăverii, a reînnoirii naturii și a speranței."
        }
      },
      {
        "@type": "Question",
        "name": "Cum aleg oul cel mai tare pentru ciocnit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Caută un ou cu o formă cât mai ascuțită la vârf, verifică sunetul (bate ușor oul de dinte — dacă sună plin și ascuțit, coaja este groasă) și strânge-l ușor în mână — oul trebuie să se simtă ferm, fără micro-fisuri ascunse."
        }
      },
      {
        "@type": "Question",
        "name": "Ce superstiții sunt legate de ciocnitul ouălor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cel care iese învingător din toate duelurile va fi sănătos și puternic tot restul anului. Dacă găsești un ou cu două gălbenușuri, vei avea parte de noroc dublu. Cojile ouălor sparte nu se aruncă la gunoi — tradiția cere să le îngropi în pământul grădinii pentru a proteja recolta."
        }
      }
    ]
  };

  return (
    <>
      <Script id="schema-traditii" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-main text-gray-200">

        <div className="w-full flex justify-between items-center p-6 md:p-8 bg-elevated shadow-lg shadow-black/20 border-b border-red-900/20">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:scale-110 transition-all">🥚</span>
            <span className="font-bold text-xl md:text-2xl text-white">Ciocnim<span className="text-red-500">.ro</span></span>
          </Link>
          <Link href="/" className="px-6 py-3 bg-red-700 text-white font-bold rounded-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95">
            Înapoi acasă
          </Link>
        </div>
        <ContentNav current="/traditii" />

        <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">

          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              Tradiția <span className="text-red-500">Ciocnitului</span>
            </h1>
            <p className="text-gray-400 font-bold text-sm md:text-base">
              Află regulile jocului de Paște care a unit generații de români.
            </p>
          </header>

          <section className="space-y-6">

            <ArticleSection title="De ce ciocnim ouă?" icon="🥚" delay={0.05}>
              <p>
                Tradiția ciocnitului ouălor de Paște este una dintre cele mai vechi datini din România. Legenda spune că Sfânta Maria Magdalena, ajungând la Roma, i-ar fi oferit împăratului Tiberiu un ou roșu, rostind cuvintele <strong className="text-red-400">&ldquo;Hristos a Înviat!&rdquo;</strong>.
              </p>
              <p>
                Culoarea roșie simbolizează sângele vărsat de Mântuitor, iar ciocnitul oului reprezintă deschiderea Sfântului Mormânt. Astăzi, acest joc a devenit un prilej de bucurie și reunire a familiei.
              </p>
            </ArticleSection>

            <ArticleSection title="Regulile Nescrise" icon="📜" delay={0.1}>
              <p>Dacă te-ai întrebat vreodată cum se ciocnesc ouăle corect, există un protocol simplu păstrat din tată-n fiu:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li><strong className="text-red-400 uppercase tracking-wider text-xs">Cap la Cap:</strong> Regula primei zile de Paște (Duminică).</li>
                <li><strong className="text-red-400 uppercase tracking-wider text-xs">Cap la Dos:</strong> Permis abia începând cu a doua zi (Luni).</li>
                <li><strong className="text-red-400 uppercase tracking-wider text-xs">Dos la Dos:</strong> Rezervat strict pentru a treia zi de sărbătoare.</li>
              </ul>
              <div className="mt-6 p-4 bg-red-900/20 border border-red-700/30 rounded-2xl">
                <p className="text-red-400 font-black italic text-center text-sm md:text-base">
                  Cel care lovește zice &ldquo;Hristos a Înviat!&rdquo;, iar celălalt răspunde &ldquo;Adevărat a Înviat!&rdquo;
                </p>
              </div>
            </ArticleSection>

            <ArticleSection title="Semnificația Culorilor" icon="🎨" delay={0.15}>
              <p>Deși oul roșu este cel mai cunoscut, tradiția românească a păstrat și alte culori, fiecare cu un sens aparte:</p>
              <ul className="space-y-3 mt-4">
                <li><strong className="text-red-600 uppercase tracking-wider text-xs">ROȘU:</strong> Simbolul jertfei, al vieții și al iubirii divine.</li>
                <li><strong className="text-yellow-600 uppercase tracking-wider text-xs">GALBEN:</strong> Reprezintă lumina, belșugul și grâul copt al verii ce urmează.</li>
                <li><strong className="text-blue-600 uppercase tracking-wider text-xs">ALBASTRU:</strong> Simbolizează cerul, credința și infinitul spiritual.</li>
                <li><strong className="text-green-600 uppercase tracking-wider text-xs">VERDE:</strong> Culoarea primăverii, a reînnoirii naturii și a speranței.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Cum Alegi Oul Tare" icon="🛡️" delay={0.2}>
              <p>Secretul câștigării duelurilor stă în alegerea oului potrivit din coș:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Caută un ou cu o formă cât mai ascuțită la vârf. Forța se concentrează mai bine pe o suprafață mică.</li>
                <li>Verifică sunetul! Unii bat ușor oul de dinte — dacă sună plin și ascuțit, coaja este groasă.</li>
                <li>Strânge-l ușor în mână. Oul trebuie să se simtă ferm, fără micro-fisuri ascunse sub stratul de vopsea.</li>
              </ul>
            </ArticleSection>

            <ArticleSection title="Superstiții Românești" icon="✨" delay={0.25}>
              <p>Jocul nu este doar o competiție, ci și un mod de a atrage norocul în casă:</p>
              <ul className="list-disc pl-6 space-y-3 mt-4">
                <li>Cine are oul cel mai tare și iese învingător din toate duelurile, va fi sănătos și puternic tot restul anului.</li>
                <li>Dacă găsești la masă un ou cu două gălbenușuri, vei avea parte de noroc dublu.</li>
                <li>Cojile ouălor sparte nu se aruncă la gunoi! Tradiția cere să le îngropi în pământul grădinii pentru a proteja recolta.</li>
              </ul>
            </ArticleSection>

          </section>

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
