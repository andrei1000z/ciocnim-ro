"use client";

import { useState, useEffect, useRef } from "react";
import { getOrthodoxEaster, getNextEaster } from "@/app/lib/easterUtils";

// Memoized outside component — Easter date doesn't change within a session
let cachedEaster = null;
function getCachedEaster() {
  if (!cachedEaster) cachedEaster = getNextEaster();
  return cachedEaster;
}

function getState() {
  const easterDate = getCachedEaster();
  const now = new Date();
  const easterStart = new Date(easterDate);
  easterStart.setHours(0, 0, 0, 0);
  const easterEnd = new Date(easterStart);
  easterEnd.setDate(easterEnd.getDate() + 1);

  if (now >= easterStart && now < easterEnd) return { type: "risen", year: easterDate.getFullYear() };

  const diff = easterStart - now;
  if (diff <= 0) return null;
  return {
    type: "countdown",
    year: easterDate.getFullYear(),
    zile: Math.floor(diff / (1000 * 60 * 60 * 24)),
    ore: Math.floor((diff / (1000 * 60 * 60)) % 24),
    min: Math.floor((diff / (1000 * 60)) % 60),
    sec: Math.floor((diff / 1000) % 60),
  };
}

export default function EasterCountdown() {
  const [state, setState] = useState(getState);

  useEffect(() => {
    const interval = setInterval(() => setState(getState()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return null;

  if (state.type === "risen") {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-900/10 p-5 shadow-sm text-center">
        <p className="text-2xl font-black text-amber-400 mb-1">Hristos a Înviat! ✝️</p>
        <p className="text-xs font-bold text-amber-500/60">Paște Fericit tuturor!</p>
      </div>
    );
  }

  const units = [
    { val: state.zile, label: "Zile" },
    { val: state.ore, label: "Ore" },
    { val: state.min, label: "Min" },
    { val: state.sec, label: "Sec" },
  ];

  return (
    <div className="rounded-2xl border border-red-900/20 bg-card p-4 shadow-sm">
      <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.3em] text-center mb-3">
        Până la Paștele Ortodox {state.year}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(u => (
          <div key={u.label} className="text-center">
            <div className="bg-red-900/20 border border-red-900/20 rounded-xl py-2 px-1">
              <span className="text-xl sm:text-2xl font-black text-heading tabular-nums">
                {String(u.val).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[9px] font-bold text-muted uppercase tracking-wider mt-1 block">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
