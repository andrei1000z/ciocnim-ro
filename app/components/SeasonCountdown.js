"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// 14 Aprilie 2026, 00:00:00 ora României (UTC+3 EEST)
const END_TS = new Date("2026-04-14T00:00:00+03:00").getTime();

function calcRemaining() {
  const now = Date.now();
  const diff = END_TS - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { days, hours, mins, secs };
}

export default function SeasonCountdown() {
  const [remaining, setRemaining] = useState(() => calcRemaining());

  useEffect(() => {
    const tick = () => setRemaining(calcRemaining());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!remaining) return null;

  const { days, hours, mins, secs } = remaining;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-3 inline-flex flex-col items-center gap-1.5 px-5 py-3 rounded-2xl bg-gradient-to-br from-red-900/20 via-red-800/10 to-amber-900/15 border border-red-700/25 shadow-lg shadow-black/20 max-w-xs mx-auto"
    >
      <p className="text-[11px] font-bold uppercase tracking-wider text-red-300/90 text-center">
        🥚 Sezonul de ciocnit 2026 se încheie în curând
      </p>
      <div className="flex items-center gap-1.5 font-black tabular-nums">
        <div className="flex flex-col items-center min-w-[34px]">
          <span className="text-xl text-heading leading-none">{days}</span>
          <span className="text-[9px] text-muted uppercase tracking-wider mt-0.5">zile</span>
        </div>
        <span className="text-red-400/40 text-lg leading-none -mt-2">:</span>
        <div className="flex flex-col items-center min-w-[34px]">
          <span className="text-xl text-heading leading-none">{pad(hours)}</span>
          <span className="text-[9px] text-muted uppercase tracking-wider mt-0.5">ore</span>
        </div>
        <span className="text-red-400/40 text-lg leading-none -mt-2">:</span>
        <div className="flex flex-col items-center min-w-[34px]">
          <span className="text-xl text-heading leading-none">{pad(mins)}</span>
          <span className="text-[9px] text-muted uppercase tracking-wider mt-0.5">min</span>
        </div>
        <span className="text-red-400/40 text-lg leading-none -mt-2">:</span>
        <div className="flex flex-col items-center min-w-[34px]">
          <span className="text-xl text-amber-300 leading-none">{pad(secs)}</span>
          <span className="text-[9px] text-muted uppercase tracking-wider mt-0.5">sec</span>
        </div>
      </div>
      <p className="text-[10px] text-amber-400/70 font-semibold italic">
        Ciocnește cât mai apuci! 🔥
      </p>
    </motion.div>
  );
}
