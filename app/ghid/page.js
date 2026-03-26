"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Script from "next/script";
import PageHeader from "../components/PageHeader";

const steps = [
  {
    title: "Pune-ți o Poreclă",
    icon: "✏️",
    desc: "Intră pe pagina principală și scrie-ți o poreclă de 3-21 caractere. Aceasta va apărea în clasament și în camerele de joc.",
    tip: "Alege ceva memorabil — adversarii tăi o vor vedea!",
  },
  {
    title: "Personalizează-ți Oul",
    icon: "🎨",
    desc: "Apasă pe oul tău pentru a alege culoarea: Roșu, Albastru, Auriu sau Verde. Fiecare culoare are un model tradițional românesc unic.",
    tip: "Culoarea nu influențează șansele — este pur estetică.",
  },
  {
    title: "Alege Modul de Joc",
    icon: "🎮",
    desc: "Ai trei opțiuni: Ciocnește cu un Prieten (cameră privată cu cod), Ciocnește cu Concetățenii (arena publică), sau creează un Grup pentru mai mulți jucători.",
    tip: null,
  },
  {
    title: "Ciocnește!",
    icon: "💥",
    desc: "Când ambii jucători sunt în cameră, ciocnirea se face automat. Un ou se sparge — celălalt supraviețuiește. Rezultatul este aleatoriu, ca în viața reală!",
    tip: "Cel care lovește zice \"Hristos a Înviat!\", celălalt răspunde \"Adevărat a Înviat!\"",
  },
  {
    title: "Urcă în Clasament",
    icon: "🏆",
    desc: "Fiecare victorie contează! Victoriile tale se adaugă automat în clasamentul național și regional. Poți vedea clasamentul complet pe pagina dedicată.",
    tip: null,
  },
  {
    title: "Deblochează Achievement-uri",
    icon: "🏅",
    desc: "Jocul are 16 achievement-uri de deblocat, de la prima victorie pana la 100 de victorii. Verifica-le pe pagina de profil!",
    tip: "Unele achievement-uri sunt secrete — descoperă-le singur!",
  },
];

const faqItems = [
  {
    q: "Este gratuit?",
    a: "Da, complet gratuit. Fără reclame, fără achiziții in-app.",
  },
  {
    q: "Trebuie să-mi fac cont?",
    a: "Nu. Pui o poreclă și joci instant. Statisticile se salvează în browser.",
  },
  {
    q: "Pot juca de pe telefon?",
    a: "Da! Ciocnim.ro funcționează pe orice telefon, tabletă sau computer cu browser. Poți chiar să-l instalezi ca aplicație.",
  },
  {
    q: "Cum invit un prieten?",
    a: "Apasă \"Ciocnește cu un Prieten\", creează o cameră, și trimite-i codul de 4 caractere prietenului tău.",
  },
  {
    q: "Ce sunt grupurile?",
    a: "Grupurile îți permit să creezi o echipă cu prietenii sau familia. Poți provoca membrii grupului la dueluri direct.",
  },
  {
    q: "Cum funcționează clasamentul?",
    a: "Fiecare victorie adaugă un punct la clasamentul tău personal și la regiunea ta. Top 10 jucători și top 20 regiuni sunt afișate.",
  },
];

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-edge rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-elevated transition-all"
      >
        <span className="font-bold text-sm text-heading">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-dim text-sm flex-shrink-0 ml-2"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-body leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function GhidPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Cum joci ciocnit ouă online pe Ciocnim.ro",
    "description": "Ghid pas cu pas pentru a juca ciocnit ouă online de Paște.",
    "step": steps.map((s, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": s.title,
      "text": s.desc,
    })),
  };

  return (
    <>
      <Script id="schema-ghid" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <main className="min-h-screen bg-main text-body">
        <PageHeader />

        <div className="w-full max-w-3xl mx-auto pt-8 pb-16 px-6 space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
              Ghid de <span className="text-red-500">Joc</span>
            </h1>
            <p className="text-dim font-bold text-sm md:text-base">
              Tot ce trebuie să știi ca să ciocnești ouă online.
            </p>
          </header>

          {/* Steps */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-heading flex items-center gap-2">
              <span>📋</span> Pas cu Pas
            </h2>
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
                className="bg-card p-5 rounded-2xl border border-edge shadow-sm flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-900/20 flex items-center justify-center">
                  <span className="text-xl">{step.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Pasul {i + 1}</span>
                  </div>
                  <h3 className="font-bold text-heading text-sm mb-1">{step.title}</h3>
                  <p className="text-body text-sm leading-relaxed">{step.desc}</p>
                  {step.tip && (
                    <p className="text-xs text-amber-400 mt-2 italic">💡 {step.tip}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <h2 className="text-xl font-black text-heading flex items-center gap-2">
              <span>❓</span> Întrebări Frecvente
            </h2>
            <div className="space-y-2">
              {faqItems.map((item, i) => (
                <FAQItem key={i} item={item} index={i} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="text-center space-y-3">
            <Link
              href="/"
              className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg"
            >
              🥚 Hai la joc!
            </Link>
            <p className="text-muted text-xs">Gratuit, fără cont, pe orice dispozitiv.</p>
          </div>
        </div>
      </main>
    </>
  );
}
