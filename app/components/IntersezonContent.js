"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import LocaleLink from "./LocaleLink";
import ContactForm from "./ContactForm";
import { getOrthodoxEaster } from "../lib/easterUtils";

export const SEASON_END_2026_TS = new Date("2026-04-15T00:00:00+03:00").getTime();
const TRANSITION_END_TS = SEASON_END_2026_TS + 7 * 24 * 3600 * 1000;

function calcCountdown(targetTs) {
  const diff = targetTs - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
function formatEasterDate(d) {
  return `${d.getDate()} ${MONTHS_RO[d.getMonth()]} ${d.getFullYear()}`;
}

export default function IntersezonContent() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("weekAfter");
  const [easter2027, setEaster2027] = useState(null);

  const [reserveName, setReserveName] = useState("");
  const [reserveStatus, setReserveStatus] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("");

  useEffect(() => {
    setMounted(true);
    const e = getOrthodoxEaster(2027);
    setEaster2027(e);
    const tick = () => {
      const now = Date.now();
      setPhase(now < TRANSITION_END_TS ? "weekAfter" : "preparing");
      setCountdown(calcCountdown(e.getTime()));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const handlePlayBot = () => {
    const roomId = `bot-intersezon-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    router.push(`/joc/${roomId}?intersezon=1`);
  };

  const handleReserve = async () => {
    if (!reserveName.trim()) { setReserveStatus("❌ Pune un nume"); return; }
    setReserveStatus("...");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "reserve-name-2027", name: reserveName.trim(), locale: "ro" }),
      });
      const data = await res.json();
      if (data.success) {
        setReserveStatus(`✅ "${reserveName.trim().toUpperCase()}" rezervat pentru 2027!`);
        setReserveName("");
      } else {
        setReserveStatus("❌ " + (data.error || "Eroare"));
      }
    } catch {
      setReserveStatus("❌ Eroare rețea");
    }
  };

  const handleNewsletter = async () => {
    if (!newsletterEmail.trim()) { setNewsletterStatus("❌ Pune email"); return; }
    setNewsletterStatus("...");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "newsletter-signup", email: newsletterEmail.trim(), locale: "ro" }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus(data.alreadySubscribed ? "✅ Ești deja abonat!" : "✅ Gata! Te anunțăm la Paște 2027");
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("❌ " + (data.error || "Eroare"));
      }
    } catch {
      setNewsletterStatus("❌ Eroare rețea");
    }
  };

  const currentYear = mounted ? new Date().getFullYear() : 2026;
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <main className="w-full max-w-2xl mx-auto pt-8 pb-16 px-4 space-y-10">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-red-900/40 to-amber-900/30 border border-red-600/30 shadow-2xl shadow-red-900/40 mb-2">
          <span className="text-5xl">🥚</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-heading tracking-tight leading-tight">
          Ciocnim<span className="text-red-500">.ro</span>
        </h1>
        <p className="text-base md:text-lg text-dim font-semibold">Ciocnește ouă online</p>

        <AnimatePresence mode="wait">
          {mounted && phase === "weekAfter" ? (
            <motion.div
              key="weekAfter"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-block bg-gradient-to-br from-red-900/30 to-amber-900/20 border border-red-600/40 rounded-2xl px-6 py-4 mt-4"
            >
              <p className="text-xl md:text-2xl font-black text-amber-300">
                🏁 Sezonul 2026 s-a încheiat
              </p>
              <p className="text-xs text-dim mt-1">Ne vedem la Paște 2027!</p>
            </motion.div>
          ) : mounted ? (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-block bg-gradient-to-br from-amber-900/30 to-red-900/20 border border-amber-600/40 rounded-2xl px-6 py-4 mt-4"
            >
              <p className="text-xl md:text-2xl font-black text-amber-300">
                🔄 Pregătește-te pentru Sezonul 2027
              </p>
              <p className="text-xs text-dim mt-1">Tradiția continuă în curând</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-edge rounded-3xl p-6 text-center"
      >
        <h2 className="text-lg md:text-xl font-black text-heading mb-2">🤖 Joacă un meci rapid cu un bot</h2>
        <p className="text-xs text-dim mb-4">Intră, apasă, ciocnește — fără clasament, fără stats, doar pentru distracție.</p>
        <button
          onClick={handlePlayBot}
          className="w-full py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-lg rounded-2xl border-2 border-red-500/60 shadow-xl shadow-red-900/40 transition-all active:scale-95"
        >
          🥚 Ciocnește cu un bot
        </button>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <LocaleLink
          href="/clasament"
          className="inline-flex items-center gap-2 bg-elevated hover:bg-elevated-hover border border-amber-700/30 text-amber-300 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95"
        >
          🏆 Vezi clasamentul 2026
        </LocaleLink>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-edge rounded-3xl p-6"
      >
        <h2 className="text-lg font-black text-heading mb-1">🔒 Rezervă un nume pentru Sezonul 2027</h2>
        <p className="text-xs text-dim mb-4">Fii primul cu porecla ta preferată la startul următorului sezon.</p>
        <div className="flex gap-2">
          <input
            value={reserveName}
            onChange={(e) => { setReserveName(e.target.value); setReserveStatus(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleReserve()}
            placeholder="Porecla ta..."
            maxLength={20}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            name="reserve2027"
            className="flex-1 min-w-0 px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body font-bold outline-none focus:border-red-700"
          />
          <button
            onClick={handleReserve}
            className="px-5 py-3 bg-red-800 hover:bg-red-700 text-white rounded-xl font-black text-sm transition-all active:scale-95"
          >
            Rezervă
          </button>
        </div>
        {reserveStatus && <p className="text-xs mt-2 text-center font-bold">{reserveStatus}</p>}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-red-900/25 via-red-800/15 to-amber-900/20 border border-red-700/30 rounded-3xl p-6 text-center"
      >
        <h2 className="text-sm font-black uppercase tracking-wider text-amber-300/80 mb-2">
          ⛪ Paștele Ortodox 2027
        </h2>
        {mounted && easter2027 && (
          <p className="text-xs text-dim mb-3">{formatEasterDate(easter2027)}</p>
        )}
        {countdown && (
          <div className="flex items-center justify-center gap-2 md:gap-3 font-black tabular-nums">
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{countdown.days}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">zile</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{pad(countdown.hours)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">ore</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{pad(countdown.mins)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">min</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-amber-300">{pad(countdown.secs)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">sec</span>
            </div>
          </div>
        )}
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-edge rounded-3xl p-6"
      >
        <h2 className="text-lg font-black text-heading mb-1">📬 Primește vestea la Paștele 2027</h2>
        <p className="text-xs text-dim mb-4">
          Lasă-mi emailul tău și îți trimit un singur mesaj, cu o săptămână înainte de Paștele 2027, să te anunț că sezonul începe. Fără spam, fără reclame, doar asta.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
            placeholder="email@exemplu.ro"
            autoComplete="email"
            className="flex-1 min-w-0 px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body font-bold outline-none focus:border-red-700 text-sm"
          />
          <button
            onClick={handleNewsletter}
            className="px-5 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-black text-sm transition-all active:scale-95"
          >
            Abonează
          </button>
        </div>
        {newsletterStatus && <p className="text-xs mt-2 text-center font-bold">{newsletterStatus}</p>}
      </motion.section>

      <ContactForm />

      <footer className="pt-6 border-t border-edge text-center">
        <p className="text-xs text-dim">© {currentYear} Ciocnim.ro</p>
      </footer>
    </main>
  );
}
