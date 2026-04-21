"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useT } from "../i18n/useT";
import { playCrack, playVictory, playDefeat, isSoundEnabled } from "../lib/sounds";

const fireConfetti = async (opts) => {
  try {
    const confetti = (await import("canvas-confetti")).default;
    confetti(opts);
  } catch {}
};

const eggPath = "M50 0 C20 0 0 40 0 80 C0 110 20 130 50 130 C80 130 100 110 100 80 C100 40 80 0 50 0 Z";
const crackPath1 = "M35 25 L42 40 L38 52 L50 65 L44 78 L52 90 L47 105 L55 118 L50 130";
const crackPath2 = "M65 20 L58 38 L63 50 L55 62 L62 75 L57 88 L65 100 L60 115";

const SKINS = {
  red: { grad1: "#dc2626", grad2: "#7f1d1d", glow: "rgba(220,38,38,0.5)" },
  blue: { grad1: "#2563eb", grad2: "#1e3a8a", glow: "rgba(37,99,235,0.5)" },
};

function Ou({ skin = "red", spart = false }) {
  const current = SKINS[skin] || SKINS.red;
  const uid = React.useId().replace(/:/g, "");

  return (
    <div
      className={`relative transition-all duration-500 flex-shrink-0 ${!spart ? "animate-float-v9" : "scale-[0.85] opacity-70 rotate-6"}`}
      style={{ width: "clamp(80px, 18vw, 130px)", height: "auto", aspectRatio: "1 / 1.35" }}
    >
      {!spart && (
        <div
          className="absolute inset-[-20%] rounded-full blur-[40px] md:blur-[50px] opacity-30 animate-pulse pointer-events-none"
          style={{ backgroundColor: current.glow }}
        />
      )}
      <svg
        viewBox="0 0 100 130"
        className="w-full h-full relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={current.grad1} />
            <stop offset="100%" stopColor={current.grad2} />
          </linearGradient>
          <radialGradient id={`hl-${uid}`} cx="38%" cy="28%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path d={eggPath} fill={`url(#grad-${uid})`} />
        <path d={eggPath} fill={`url(#hl-${uid})`} opacity="0.6" />
        {spart && (
          <g stroke="rgba(0,0,0,0.9)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" className="crack-animate">
            <path d={crackPath1} className="crack-line-1" />
            <path d={crackPath2} className="crack-line-2" />
            <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
              <path d={crackPath1} className="crack-line-1" />
              <path d={crackPath2} className="crack-line-2" />
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function IntersezonBotGame() {
  const router = useRouter();
  const t = useT();
  const [phase, setPhase] = useState("ready"); // ready | striking | done
  const [winner, setWinner] = useState(null); // "player" | "bot"
  const [streak, setStreak] = useState(0);
  const [rounds, setRounds] = useState(0);

  const ciocnește = useCallback(() => {
    if (phase !== "ready") return;
    setPhase("striking");
    if (isSoundEnabled()) playCrack();
    if (navigator.vibrate) navigator.vibrate(30);
    const w = Math.random() < 0.5 ? "player" : "bot";
    setTimeout(() => {
      setWinner(w);
      setPhase("done");
      setRounds((r) => r + 1);
      if (w === "player") {
        setStreak((s) => s + 1);
        if (isSoundEnabled()) playVictory();
        fireConfetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#fbbf24", "#dc2626", "#f59e0b", "#ffffff"],
        });
        if (navigator.vibrate) navigator.vibrate([40, 30, 80]);
      } else {
        setStreak(0);
        if (isSoundEnabled()) playDefeat();
        if (navigator.vibrate) navigator.vibrate([100, 40, 100]);
      }
    }, 700);
  }, [phase]);

  const reset = useCallback(() => {
    setWinner(null);
    setPhase("ready");
  }, []);

  const botSpart = phase === "done" && winner === "player";
  const playerSpart = phase === "done" && winner === "bot";

  return (
    <main className="h-[100dvh] w-full bg-main text-body flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[60vw] h-[60vw] bg-amber-900/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between px-4 py-2">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-dim hover:text-body font-bold transition-colors"
        >
          {t('botGame.back')}
        </button>
        <p className="text-xs text-dim font-bold uppercase tracking-wider">{t('botGame.training')}</p>
        <div className="flex items-center gap-2 min-w-[64px] justify-end">
          {streak > 1 && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={streak}
              className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-900/40 to-red-900/40 border border-amber-600/40 text-amber-300 px-2 py-0.5 rounded-lg font-black text-xs"
            >
              🔥 {streak}
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2 px-4 relative z-10">
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-[10px] text-dim font-black uppercase tracking-widest">{t('botGame.bot')}</p>
          <motion.div
            animate={
              phase === "striking"
                ? { y: [0, 60, 40], rotate: [0, 8, 0] }
                : { y: 0, rotate: 0 }
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Ou skin="blue" spart={botSpart} />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <motion.div
            animate={
              phase === "striking"
                ? { y: [0, -60, -40], rotate: [0, -8, 0] }
                : { y: 0, rotate: 0 }
            }
            transition={{ duration: 0.7, ease: "easeInOut" }}
          >
            <Ou skin="red" spart={playerSpart} />
          </motion.div>
          <p className="text-[10px] text-dim font-black uppercase tracking-widest">{t('botGame.you')}</p>
        </div>
      </div>

      <div className="relative z-10 px-4 pb-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase !== "done" ? (
            <motion.button
              key="strike"
              onClick={ciocnește}
              disabled={phase === "striking"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-black text-lg rounded-2xl border-2 border-red-500/60 shadow-xl shadow-red-900/40 transition-all active:scale-95"
            >
              {t('botGame.strike')}
            </motion.button>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div
                className={`text-center rounded-2xl p-3 border-2 ${
                  winner === "player"
                    ? "bg-gradient-to-br from-green-900/40 to-amber-900/30 border-amber-500/60"
                    : "bg-gradient-to-br from-red-900/40 to-zinc-900/30 border-red-700/60"
                }`}
              >
                <p className="text-xl font-black text-heading">
                  {winner === "player" ? t('botGame.victory') : t('botGame.defeat')}
                </p>
              </div>
              <button
                onClick={reset}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-black text-base rounded-2xl border-2 border-red-500/60 transition-all active:scale-95"
              >
                {t('botGame.again')}
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 bg-elevated hover:bg-elevated-hover text-dim hover:text-body font-bold text-sm rounded-2xl border border-edge transition-all active:scale-95"
              >
                {t('botGame.home')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
