"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";

const Section = ({ title, icon, children, delay = 0 }) => (
  <motion.section
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className="bg-card p-8 rounded-2xl border border-edge shadow-lg shadow-black/20"
  >
    <div className="flex items-center gap-4 mb-6">
      <span className="text-4xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-black text-heading">{title}</h2>
    </div>
    <div className="space-y-4 text-body text-sm md:text-base font-medium leading-relaxed">
      {children}
    </div>
  </motion.section>
);

export default function DesprePage() {
  return (
    <main className="min-h-screen bg-main text-body">
      <PageHeader />

      <div className="w-full max-w-4xl mx-auto pt-8 pb-16 px-6 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black text-heading leading-tight">
            Despre <span className="text-red-500">Ciocnim.ro</span>
          </h1>
          <p className="text-dim font-bold text-sm md:text-base">
            Povestea din spatele jocului tradițional de Paște, mutat în online.
          </p>
        </header>

        <Section title="Misiunea Noastră" icon="🎯" delay={0.05}>
          <p>
            Ciocnim.ro s-a născut dintr-o idee simplă: <strong className="text-red-400">să aducem tradiția ciocnitului de ouă în era digitală</strong>, fără să pierdem din farmecul ei.
          </p>
          <p>
            Fie că ești departe de familie, fie că vrei să te distrezi cu prietenii într-un mod nou, Ciocnim.ro îți oferă experiența autentică a ciocnitului de ouă — direct din browser, pe orice dispozitiv.
          </p>
        </Section>

        <Section title="Cum Funcționează" icon="⚙️" delay={0.1}>
          <p>Fiecare joc simulează un duel real de ciocnit ouă:</p>
          <ul className="list-disc pl-6 space-y-2 mt-3">
            <li>Alegi o poreclă și personalizezi oul tău (culoare, accesorii).</li>
            <li>Creezi o cameră privată sau intri în Arena pentru a găsi un adversar random.</li>
            <li>Ouăle se ciocnesc în timp real — unul se sparge, celălalt supraviețuiește.</li>
            <li>Victoriile tale urcă în clasamentul național și regional.</li>
          </ul>
        </Section>

        <Section title="Tradiție & Tehnologie" icon="🔧" delay={0.15}>
          <p>
            Ciocnim.ro combină tradiția românească cu tehnologie modernă:
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "Timp real", desc: "WebSocket pentru dueluri instantanee", icon: "⚡" },
              { label: "PWA", desc: "Instalabil pe telefon ca aplicație", icon: "📱" },
              { label: "Clasamente", desc: "Top jucători și regiuni, actualizat live", icon: "🏆" },
              { label: "Achievement-uri", desc: "16 realizări de deblocat", icon: "🏅" },
              { label: "Grupuri", desc: "Creează echipe și provoacă prietenii", icon: "👥" },
              { label: "Teme", desc: "Mod întunecat și luminos", icon: "🎨" },
            ].map(item => (
              <div key={item.label} className="bg-elevated p-3 rounded-xl border border-edge">
                <span className="text-xl">{item.icon}</span>
                <p className="font-bold text-xs text-heading mt-1">{item.label}</p>
                <p className="text-[11px] text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Gratuit, Pentru Totdeauna" icon="💝" delay={0.2}>
          <p>
            Ciocnim.ro este și va rămâne <strong className="text-red-400">gratuit</strong>. Nu avem reclame, nu vindem date, nu avem achiziții in-app. Proiectul există din dorința de a păstra tradiția vie și de a aduce bucurie în perioada Paștelui.
          </p>
          <p>
            Dacă vrei să ne susții, cel mai bun lucru pe care îl poți face este să <strong className="text-red-400">trimiți jocul unui prieten</strong> sau să ne lași o stea pe GitHub.
          </p>
        </Section>

        <Section title="Echipa" icon="🧑‍💻" delay={0.25}>
          <p>
            Ciocnim.ro este creat cu drag de o echipă mică din România, pasionată de tradiții și tehnologie. Fiecare linie de cod este scrisă cu gândul la experiența jucătorilor.
          </p>
          <div className="mt-4 p-4 bg-red-900/20 border border-red-700/30 rounded-2xl text-center">
            <p className="text-red-400 font-black italic text-sm md:text-base">
              &ldquo;Hristos a Înviat! Să ciocnim virtual când nu putem în persoană.&rdquo;
            </p>
            <p className="text-muted text-xs mt-2">— Echipa Ciocnim.ro</p>
          </div>
        </Section>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-lg border border-red-800 hover:bg-red-600 transition-all active:scale-95 shadow-lg text-center"
          >
            🥚 Joacă acum
          </Link>
          <Link
            href="/ghid"
            className="inline-block bg-card text-heading px-8 py-4 rounded-2xl font-black text-lg border border-edge hover:bg-elevated transition-all active:scale-95 text-center"
          >
            📖 Ghid de joc
          </Link>
        </div>
      </div>
    </main>
  );
}
