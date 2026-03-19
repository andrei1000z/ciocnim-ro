"use client";

import { useState, useEffect } from "react";

// Orthodox Easter date using the Meeus Julian algorithm
function getOrthodoxEaster(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31); // 3=March, 4=April (Julian)
  const day = ((d + e + 114) % 31) + 1;
  // Convert from Julian to Gregorian: add 13 days for 2000-2099
  const julian = new Date(year, month - 1, day);
  julian.setDate(julian.getDate() + 13);
  return julian;
}

function getNextEaster() {
  const now = new Date();
  let easter = getOrthodoxEaster(now.getFullYear());
  // If Easter already passed this year, calculate for next year
  const easterEnd = new Date(easter);
  easterEnd.setDate(easterEnd.getDate() + 1); // show "Hristos a Înviat" for the full day
  if (now > easterEnd) {
    easter = getOrthodoxEaster(now.getFullYear() + 1);
  }
  return easter;
}

const EASTER_DATE = getNextEaster();
const EASTER_YEAR = EASTER_DATE.getFullYear();

function getState() {
  const now = new Date();
  const easterStart = new Date(EASTER_DATE);
  easterStart.setHours(0, 0, 0, 0);
  const easterEnd = new Date(easterStart);
  easterEnd.setDate(easterEnd.getDate() + 1);

  if (now >= easterStart && now < easterEnd) return { type: "risen" };

  const diff = easterStart - now;
  if (diff <= 0) return null;
  return {
    type: "countdown",
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
      <div className="rounded-2xl border border-amber-500/20 bg-amber-900/10 backdrop-blur-xl p-5 shadow-sm text-center">
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
    <div className="rounded-2xl border border-red-900/20 bg-white/[0.04] backdrop-blur-xl p-4 shadow-sm">
      <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-[0.3em] text-center mb-3">
        Până la Paștele Ortodox {EASTER_YEAR}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {units.map(u => (
          <div key={u.label} className="text-center">
            <div className="bg-red-900/20 border border-red-900/20 rounded-xl py-2 px-1">
              <span className="text-xl sm:text-2xl font-black text-white tabular-nums">
                {String(u.val).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mt-1 block">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
