"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import LocaleLink from "./LocaleLink";
import ContactForm from "./ContactForm";
import { getOrthodoxEaster } from "../lib/easterUtils";
import { formatFullDate } from "../lib/seasons";
import { useT } from "../i18n/useT";
import { useLocaleConfig } from "./DictionaryProvider";

export const SEASON_END_2026_TS = new Date("2026-04-15T00:00:00+03:00").getTime();
const TRANSITION_END_TS = SEASON_END_2026_TS + 7 * 24 * 3600 * 1000;
const CURRENT_SEASON_YEAR = 2026;
const NEXT_SEASON_YEAR = 2027;

function calcCountdown(targetTs) {
  const diff = targetTs - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

export default function IntersezonContent() {
  const router = useRouter();
  const t = useT();
  const { locale, gameName } = useLocaleConfig();
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
    const e = getOrthodoxEaster(NEXT_SEASON_YEAR);
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
    const code = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    router.push(`/joc/${code}`);
  };

  const handleReserve = async () => {
    if (!reserveName.trim()) { setReserveStatus(t('intersezon.reserveNoName')); return; }
    setReserveStatus("...");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "reserve-name-2027", name: reserveName.trim(), locale }),
      });
      const data = await res.json();
      if (data.success) {
        setReserveStatus(t('intersezon.reserveSuccess', { name: reserveName.trim().toUpperCase(), year: NEXT_SEASON_YEAR }));
        setReserveName("");
      } else {
        setReserveStatus(t('intersezon.reserveError') + " " + (data.error || ""));
      }
    } catch {
      setReserveStatus(t('intersezon.reserveNetError'));
    }
  };

  const handleNewsletter = async () => {
    if (!newsletterEmail.trim()) { setNewsletterStatus(t('intersezon.newsletterNoEmail')); return; }
    setNewsletterStatus("...");
    try {
      const res = await fetch("/api/ciocnire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actiune: "newsletter-signup", email: newsletterEmail.trim(), locale }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterStatus(data.alreadySubscribed ? t('intersezon.newsletterAlready') : t('intersezon.newsletterSuccess', { year: NEXT_SEASON_YEAR }));
        setNewsletterEmail("");
      } else {
        setNewsletterStatus(t('intersezon.newsletterError') + " " + (data.error || ""));
      }
    } catch {
      setNewsletterStatus(t('intersezon.newsletterNetError'));
    }
  };

  const currentYear = mounted ? new Date().getFullYear() : CURRENT_SEASON_YEAR;
  const pad = (n) => String(n).padStart(2, "0");
  const siteName = locale === 'ro' ? 'Ciocnim.ro' : 'Trosc.fun';

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
          {t('hero.title')}<span className="text-red-500">{t('hero.titleDot')}</span>{t('hero.titleSuffix')}
        </h1>
        <p className="text-base md:text-lg text-dim font-semibold">{t('hero.subtitle')}</p>

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
                {t('intersezon.seasonEnded', { year: CURRENT_SEASON_YEAR })}
              </p>
              <p className="text-xs text-dim mt-1">{t('intersezon.seeYouNext', { year: NEXT_SEASON_YEAR })}</p>
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
                {t('intersezon.prepareNext', { year: NEXT_SEASON_YEAR })}
              </p>
              <p className="text-xs text-dim mt-1">{t('intersezon.traditionContinues')}</p>
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
        <h2 className="text-lg md:text-xl font-black text-heading mb-2">{t('intersezon.botTitle')}</h2>
        <p className="text-xs text-dim mb-4">{t('intersezon.botDesc')}</p>
        <button
          onClick={handlePlayBot}
          className="w-full py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-lg rounded-2xl border-2 border-red-500/60 shadow-xl shadow-red-900/40 transition-all active:scale-95"
        >
          {t('intersezon.botButton')}
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
          {t('intersezon.leaderboardButton', { year: CURRENT_SEASON_YEAR })}
        </LocaleLink>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-edge rounded-3xl p-6"
      >
        <h2 className="text-lg font-black text-heading mb-1">{t('intersezon.reserveTitle', { year: NEXT_SEASON_YEAR })}</h2>
        <p className="text-xs text-dim mb-4">{t('intersezon.reserveDesc')}</p>
        <div className="flex gap-2">
          <input
            value={reserveName}
            onChange={(e) => { setReserveName(e.target.value); setReserveStatus(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleReserve()}
            placeholder={t('intersezon.reservePlaceholder')}
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
            {t('intersezon.reserveButton')}
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
          {t('intersezon.countdownTitle', { year: NEXT_SEASON_YEAR })}
        </h2>
        {mounted && easter2027 && (
          <p className="text-xs text-dim mb-3">{formatFullDate(easter2027, locale)}</p>
        )}
        {countdown && (
          <div className="flex items-center justify-center gap-2 md:gap-3 font-black tabular-nums">
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{countdown.days}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">{t('intersezon.days')}</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{pad(countdown.hours)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">{t('intersezon.hours')}</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-heading">{pad(countdown.mins)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">{t('intersezon.mins')}</span>
            </div>
            <span className="text-red-400/40 text-xl md:text-3xl -mt-3">:</span>
            <div className="flex flex-col items-center min-w-[52px] md:min-w-[64px]">
              <span className="text-2xl md:text-4xl text-amber-300">{pad(countdown.secs)}</span>
              <span className="text-[9px] md:text-[10px] text-muted uppercase tracking-wider mt-0.5">{t('intersezon.secs')}</span>
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
        <h2 className="text-lg font-black text-heading mb-1">{t('intersezon.newsletterTitle', { year: NEXT_SEASON_YEAR })}</h2>
        <p className="text-xs text-dim mb-4">{t('intersezon.newsletterDesc', { year: NEXT_SEASON_YEAR })}</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={newsletterEmail}
            onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleNewsletter()}
            placeholder={t('intersezon.newsletterPlaceholder')}
            autoComplete="email"
            className="flex-1 min-w-0 px-4 py-3 bg-elevated border border-edge-strong rounded-xl text-body font-bold outline-none focus:border-red-700 text-sm"
          />
          <button
            onClick={handleNewsletter}
            className="px-5 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-black text-sm transition-all active:scale-95"
          >
            {t('intersezon.newsletterButton')}
          </button>
        </div>
        {newsletterStatus && <p className="text-xs mt-2 text-center font-bold">{newsletterStatus}</p>}
      </motion.section>

      <ContactForm />

      <footer className="pt-6 border-t border-edge text-center">
        <p className="text-xs text-dim">© {currentYear} {siteName}</p>
      </footer>
    </main>
  );
}
