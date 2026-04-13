"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// 15 Aprilie 2026, 00:00:00 ora României (UTC+3 EEST)
const END_TS = new Date("2026-04-15T00:00:00+03:00").getTime();

function calcRemaining() {
  const now = Date.now();
  const diff = END_TS - now;
  if (diff <= 0) return null;
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return { hours, mins, secs };
}

export default function SeasonCountdown() {
  // Inițializat pe null ca să evităm hydration mismatch (Date.now() diferă între SSR și client)
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const tick = () => setRemaining(calcRemaining());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!remaining) return null;

  const { hours, mins, secs } = remaining;
  const pad = (n) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="inline-flex flex-col items-center gap-1 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-red-900/25 via-red-800/15 to-amber-900/15 border border-red-700/30 shadow-md shadow-black/30"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-red-300/90 text-center leading-tight">
        🥚 Sezonul de ciocnit 2026 se încheie în curând
      </p>
      <span className="text-xl font-black tabular-nums text-heading leading-none">
        {pad(hours)}<span className="text-red-400/50">:</span>{pad(mins)}<span className="text-red-400/50">:</span><span className="text-amber-300">{pad(secs)}</span>
      </span>
      <p className="text-[10px] text-amber-400/80 font-semibold italic leading-tight">
        Ciocnește cât mai apuci! 🔥
      </p>
    </motion.div>
  );
}
